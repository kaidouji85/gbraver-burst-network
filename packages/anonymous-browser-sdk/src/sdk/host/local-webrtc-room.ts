import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { fromEvent, Unsubscribable } from "rxjs";

import { AbortManager } from "../../abort-controller/abort-manager";
import { createICECandidateErrorMessage } from "../../webrtc/gather-all-ice-candidate";
import { getSelectedIceCandidateSummary } from "../../webrtc/get-selected-ice-candidate-summary";
import { sendHostMessage } from "../../webrtc/host/host-message";
import { hostPingPongCheck } from "../../webrtc/host/host-ping-pong-check";
import { requestSelectedPlayer } from "../../webrtc/host/request-selected-player";
import { waitUntilConnected } from "../../webrtc/wait-until-connected";
import { waitUntilDataChannelOpen } from "../../webrtc/wait-until-data-channel-ready";
import { deleteSignalingChannel } from "../../websocket-api/delete-signaling-channel";
import { notifyIceCandidateReceived } from "../../websocket-api/notify-ice-candidate-recieved";
import { sendToWSSignal } from "../../websocket-api/send-to-ws-signal";
import { waitUntilMatching } from "../../websocket-api/wait-until-matching";
import { waitUntilSDPReceive } from "../../websocket-api/wait-until-sdp-recieve";
import { AnonymousBattleSDK } from "../anonymous-battle-sdk";
import { FrontendLogManager } from "../frontend-log-manager";
import { WebSocketConnectionManager } from "../websocket-connection-manager";
import { HostBattleSDK } from "./host-battle-sdk";
import { HostWebRTCConnectionManager } from "./host-webrtc-connection-manager";

/** ローカルWebRTC ルーム */
export type LocalWebRTCRoom = {
  /** ルームID */
  readonly roomID: string;

  /**
   * マッチングするまで待機する
   * @returns マッチングした相手とのバトルSDK
   */
  waitUntilMatching: () => Promise<AnonymousBattleSDK>;
};

/** ローカルWebRTCルームの実装 */
export class LocalWebRTCRoomImpl implements LocalWebRTCRoom {
  /** ルームID */
  roomID: string;
  /** ログ用の識別子 */
  #spanId: string;
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: HostWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;
  /** フロントエンドログマネージャー */
  #frontendLog: FrontendLogManager;
  /** アボート管理オブジェクト */
  #abortManager: AbortManager;
  /** ホストが選択したアームドーザID */
  #hostArmdozerId: ArmdozerId;
  /** ホストが選択したパイロットID */
  #hostPilotId: PilotId;

  /**
   * コンストラクタ
   * @param options ルームの生成に必要なオプション
   * @param options.spanId ログ用の識別子
   * @param options.roomID ルームID
   * @param options.webRTCConnection WebRTCコネクションマネジャー
   * @param options.websocketConnection WebSocketコネクションマネジャー
   * @param options.frontendLog フロントエンドログマネジャー
   * @param options.abortManager アボート管理オブジェクト
   */
  constructor(options: {
    roomID: string;
    spanId: string;
    webRTCConnection: HostWebRTCConnectionManager;
    websocketConnection: WebSocketConnectionManager;
    frontendLog: FrontendLogManager;
    hostArmdozerId: ArmdozerId;
    hostPilotId: PilotId;
    abortManager: AbortManager;
  }) {
    const {
      roomID,
      spanId,
      webRTCConnection,
      websocketConnection,
      hostArmdozerId,
      hostPilotId,
      frontendLog,
      abortManager,
    } = options;
    this.roomID = roomID;
    this.#spanId = spanId;
    this.#webRTCConnection = webRTCConnection;
    this.#websocketConnection = websocketConnection;
    this.#hostArmdozerId = hostArmdozerId;
    this.#hostPilotId = hostPilotId;
    this.#frontendLog = frontendLog;
    this.#abortManager = abortManager;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<AnonymousBattleSDK> {
    const { signal } = this.#abortManager.getAbortController();
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }

    const websocket = await this.#websocketConnection.getOrCreate();
    const signalingID = await this.#signaling(websocket);
    const { dataChannel } =
      await this.#webRTCConnection.getOrCreateConnection();
    await hostPingPongCheck({ dataChannel, signal });
    this.#websocketConnection.gracefulDisconnect();

    const flowID = nanoid();
    const { armdozerId: guestArmdozerId, pilotId: guestPilotId } =
      await requestSelectedPlayer({ dataChannel, flowID });
    const battleSDK = new HostBattleSDK({
      hostArmdozerId: this.#hostArmdozerId,
      hostPilotId: this.#hostPilotId,
      guestArmdozerId,
      guestPilotId,
      webRTCConnection: this.#webRTCConnection,
      abortManager: this.#abortManager,
    });
    sendHostMessage(dataChannel, {
      type: "battle-start",
      flowID: battleSDK.flowID,
      hostPlayer: battleSDK.player,
      guestPlayer: battleSDK.enemy,
      update: battleSDK.initialState,
    });
    await deleteSignalingChannel({ signalingID, websocket });
    return battleSDK;
  }

  /**
   * シグナリングを行う
   * @param websocket WebSocketコネクション
   * @returns シグナリングID
   */
  async #signaling(websocket: WebSocket): Promise<string> {
    const { signal } = this.#abortManager.getAbortController();
    if (signal.aborted) {
      return Promise.reject(signal.reason);
    }

    let unSubscribers: Unsubscribable[] = [];
    try {
      await this.#frontendLog.log({
        type: "SIGNALING_START",
        spanId: this.#spanId,
      });

      const signalingID = await waitUntilMatching({ websocket, signal });
      const { connection, dataChannel } =
        await this.#webRTCConnection.getOrCreateConnection();

      let isRemoteDescriptionSet = false;
      const pendingIceCandidates: RTCIceCandidateInit[] = [];

      // イベントを取り逃がさないように、あらかじめハンドラをセットしておく
      unSubscribers = [
        notifyIceCandidateReceived(websocket).subscribe((iceCandidate) => {
          if (isRemoteDescriptionSet) {
            connection.addIceCandidate(iceCandidate);
          } else {
            pendingIceCandidates.push(iceCandidate);
          }
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
          this.#frontendLog.log({
            type: "ICE_CANDIDATE_ERROR",
            spanId: this.#spanId,
            error: createICECandidateErrorMessage(event),
          });
        }),
      ];

      const sdp = await connection.createOffer();
      await connection.setLocalDescription(sdp);
      sendToWSSignal(websocket, {
        action: "send-sdp",
        signalingID,
        sdp,
      });
      const remoteSDP = await waitUntilSDPReceive({ websocket, signal });
      await connection.setRemoteDescription(remoteSDP);
      isRemoteDescriptionSet = true;
      pendingIceCandidates.forEach((iceCandidate) => {
        connection.addIceCandidate(iceCandidate);
      });
      await Promise.all([
        waitUntilConnected(connection, { signal }),
        waitUntilDataChannelOpen(dataChannel, { signal }),
      ]);

      await this.#frontendLog.log({
        type: "SIGNALING_END",
        spanId: this.#spanId,
      });
      const selectedLocalIceCandidateSummary =
        await getSelectedIceCandidateSummary(connection);
      if (selectedLocalIceCandidateSummary !== null) {
        await this.#frontendLog.log({
          type: "SELECTED_ICE_CANDIDATE_SUMMARY",
          spanId: this.#spanId,
          summary: selectedLocalIceCandidateSummary,
        });
      }
      return signalingID;
    } finally {
      unSubscribers.forEach((u) => u.unsubscribe());
    }
  }
}
