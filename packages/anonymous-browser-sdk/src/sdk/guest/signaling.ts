import { fromEvent, Unsubscribable } from "rxjs";

import { SignalContainer } from "../../abort-controller/signal-container";
import { createICECandidateErrorMessage } from "../../webrtc/gather-all-ice-candidate";
import { getSelectedIceCandidateSummary } from "../../webrtc/get-selected-ice-candidate-summary";
import { waitUntilConnected } from "../../webrtc/wait-until-connected";
import { joinRoom } from "../../websocket-api/join-room";
import { notifyIceCandidateReceived } from "../../websocket-api/notify-ice-candidate-recieved";
import { sendToWSSignal } from "../../websocket-api/send-to-ws-signal";
import { waitUntilSDPReceive } from "../../websocket-api/wait-until-sdp-recieve";
import { FrontendLogManager } from "../frontend-log-manager";

/**
 * シグナリングを行う
 * @param options シグナリングのオプション
 * @param options.spanId ログ用の識別子
 * @param options.roomID ルームID
 * @param options.frontendLog フロントエンドのログマネージャー
 * @param options.connection WebRTCコネクション
 * @param options.websocket WebSocketコネクション
 * @param options.signal アボートシグナル
 * @returns シグナリングが成功した場合はtrue、失敗した場合はfalse
 */
export const signaling = async (
  options: {
    spanId: string;
    roomID: string;
    frontendLog: FrontendLogManager;
    websocket: WebSocket;
    connection: RTCPeerConnection;
  } & SignalContainer,
): Promise<boolean> => {
  const { roomID, spanId, frontendLog, websocket, connection, signal } =
    options;
  if (signal.aborted) {
    return Promise.reject(signal.reason);
  }

  let unSubscribers: Unsubscribable[] = [];
  try {
    // 取りこぼしを防ぐために、あらかじめイベントを登録しておく（Promise形式）
    const joinRoomAcceptedPromise = joinRoom({ websocket, roomID, signal });
    const remoteSDPPromise = waitUntilSDPReceive({ websocket, signal });
    const setRemoteSDPPromise = remoteSDPPromise.then((remoteSDP) =>
      connection.setRemoteDescription(remoteSDP),
    );
    // 取りこぼしを防ぐために、あらかじめイベントを登録しておく（RxJS形式）
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
        joinRoomAcceptedPromise.then((joinRoomAccepted) => {
          if (joinRoomAccepted && event.candidate) {
            sendToWSSignal(websocket, {
              action: "send-ice-candidate",
              signalingID: joinRoomAccepted.signalingID,
              iceCandidate: event.candidate,
            });
          }
        });
      }),
      fromEvent<RTCPeerConnectionIceErrorEvent>(
        connection,
        "icecandidateerror",
      ).subscribe((event) => {
        frontendLog.log(
          {
            type: "ICE_CANDIDATE_ERROR",
            spanId,
            error: createICECandidateErrorMessage(event),
          },
          { signal },
        );
      }),
    ];

    const joinRoomAccepted = await joinRoomAcceptedPromise;
    if (!joinRoomAccepted) {
      return false;
    }

    await frontendLog.log({ type: "SIGNALING_START", spanId }, { signal });

    const { signalingID } = joinRoomAccepted;
    await setRemoteSDPPromise;
    const sdp = await connection.createAnswer();
    await connection.setLocalDescription(sdp);
    sendToWSSignal(websocket, {
      action: "send-sdp",
      signalingID,
      sdp,
    });
    await waitUntilConnected(connection, { signal });

    const selectedLocalIceCandidateSummary =
      await getSelectedIceCandidateSummary(connection);
    if (selectedLocalIceCandidateSummary !== null) {
      await frontendLog.log(
        {
          type: "SELECTED_ICE_CANDIDATE_SUMMARY",
          spanId,
          summary: selectedLocalIceCandidateSummary,
        },
        { signal },
      );
    }

    return true;
  } finally {
    unSubscribers.forEach((unSubscriber) => unSubscriber.unsubscribe());
    await frontendLog.log({ type: "SIGNALING_END", spanId }, { signal });
  }
};
