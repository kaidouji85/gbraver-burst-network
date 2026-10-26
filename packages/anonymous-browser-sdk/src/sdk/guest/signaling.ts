import { fromEvent, Unsubscribable } from "rxjs";

import { createICECandidateErrorMessage } from "../../webrtc/gather-all-ice-candidate";
import { getSelectedIceCandidateSummary } from "../../webrtc/get-selected-ice-candidate-summary";
import { waitUntilConnected } from "../../webrtc/wait-until-connected";
import { notifyIceCandidateReceived } from "../../websocket-api/notify-ice-candidate-recieved";
import { sendToWSSignal } from "../../websocket-api/send-to-ws-signal";
import { FrontendLogManager } from "../frontend-log-manager";

/**
 * シグナリングを行う
 * 本処理の前にRemoteSDPを取得しておく必要がある
 * @param options シグナリングのオプション
 * @param options.signalingID シグナリングID
 * @param options.spanId ログ用の識別子
 * @param options.remoteSDP ホスト側のSDP
 * @param options.frontendLog フロントエンドのログマネージャー
 * @param options.rconnection WebRTCコネクション
 * @param options.websocket WebSocketコネクション
 * @param options.signal アボートシグナル
 * @returns シグナリングが完了したら発火するPromise
 */
export const signaling = async (options: {
  signalingID: string;
  spanId: string;
  remoteSDP: RTCSessionDescriptionInit;
  frontendLog: FrontendLogManager;
  websocket: WebSocket;
  connection: RTCPeerConnection;
  signal: AbortSignal;
}): Promise<void> => {
  const {
    signalingID,
    spanId,
    remoteSDP,
    frontendLog,
    websocket,
    connection,
    signal,
  } = options;
  if (signal.aborted) {
    return Promise.reject(signal.reason);
  }

  let unSubscribers: Unsubscribable[] = [];
  try {
    await frontendLog.log({
      type: "SIGNALING_START",
      spanId,
    });

    const setRemoteSDPPromise = connection.setRemoteDescription(remoteSDP);
    unSubscribers = [
      notifyIceCandidateReceived(websocket).subscribe((iceCandidate) => {
        // RemoteSDPがセットされた後にICE Candidateを追加する
        // そのためにsetRemoteSDPPromiseを使って、RemoteSDPがセットされるまで待機する
        setRemoteSDPPromise.then(() => {
          connection.addIceCandidate(iceCandidate);
        });
      }),
      fromEvent<RTCPeerConnectionIceEvent>(
        connection,
        "icecandidate",
      ).subscribe((event) => {
        if (event.candidate) {
          sendToWSSignal(websocket, {
            action: "send-ice-candidate",
            signalingID,
            iceCandidate: event.candidate,
          });
        }
      }),
      fromEvent<RTCPeerConnectionIceErrorEvent>(
        connection,
        "icecandidateerror",
      ).subscribe((event) => {
        frontendLog.log({
          type: "ICE_CANDIDATE_ERROR",
          spanId,
          error: createICECandidateErrorMessage(event),
        });
      }),
    ];
    await setRemoteSDPPromise;

    const sdp = await connection.createAnswer();
    await connection.setLocalDescription(sdp);
    sendToWSSignal(websocket, {
      action: "send-sdp",
      signalingID,
      sdp,
    });
    await waitUntilConnected(connection, { signal });

    await frontendLog.log({
      type: "SIGNALING_END",
      spanId,
    });

    const selectedLocalIceCandidateSummary =
      await getSelectedIceCandidateSummary(connection);
    if (selectedLocalIceCandidateSummary !== null) {
      await frontendLog.log({
        type: "SELECTED_ICE_CANDIDATE_SUMMARY",
        spanId,
        summary: selectedLocalIceCandidateSummary,
      });
    }
  } finally {
    unSubscribers.forEach((unSubscriber) => unSubscriber.unsubscribe());
  }
};
