import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";
import { fromEvent, Unsubscribable } from "rxjs";

import { createICECandidateErrorMessage } from "../webrtc/gather-all-ice-candidate";
import { sendHostMessage } from "../webrtc/host/host-message";
import { requestSelectedPlayer } from "../webrtc/host/request-selected-player";
import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilDataChannelOpen } from "../webrtc/wait-until-data-channel-ready";
import { notifyIceCandidateReceived } from "../websocket-api/notify-ice-candidate-recieved";
import { sendToWSSignal } from "../websocket-api/send-to-ws-signal";
import { waitUntilMatching } from "../websocket-api/wait-until-matching";
import { waitUntilSDPReceive } from "../websocket-api/wait-until-sdp-recieve";
import { BattleSDK } from "./battle-sdk";
import { FrontendLogManager } from "./frontend-log-manager";
import { HostBattleSDK } from "./host-battle-sdk";
import { HostWebRTCConnectionManager } from "./host-webrtc-connection-manager";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTC ルーム */
export type LocalWebRTCRoom = {
  /** ルームID */
  readonly roomID: string;

  /**
   * マッチングするまで待機する
   * @returns マッチングした相手とのバトルSDK
   */
  waitUntilMatching: () => Promise<BattleSDK>;
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
   */
  constructor(options: {
    roomID: string;
    spanId: string;
    webRTCConnection: HostWebRTCConnectionManager;
    websocketConnection: WebSocketConnectionManager;
    frontendLog: FrontendLogManager;
    hostArmdozerId: ArmdozerId;
    hostPilotId: PilotId;
  }) {
    const {
      roomID,
      spanId,
      webRTCConnection,
      websocketConnection,
      hostArmdozerId,
      hostPilotId,
      frontendLog,
    } = options;
    this.roomID = roomID;
    this.#spanId = spanId;
    this.#webRTCConnection = webRTCConnection;
    this.#websocketConnection = websocketConnection;
    this.#hostArmdozerId = hostArmdozerId;
    this.#hostPilotId = hostPilotId;
    this.#frontendLog = frontendLog;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<BattleSDK> {
    await this.#signaling();
    const { dataChannel } =
      await this.#webRTCConnection.getOrCreateConnection();
    const flowID = nanoid();
    const { armdozerId: guestArmdozerId, pilotId: guestPilotId } =
      await requestSelectedPlayer(dataChannel, flowID);
    const battleSDK = new HostBattleSDK({
      hostArmdozerId: this.#hostArmdozerId,
      hostPilotId: this.#hostPilotId,
      guestArmdozerId,
      guestPilotId,
      webRTCConnection: this.#webRTCConnection,
    });
    sendHostMessage(dataChannel, {
      type: "battle-start",
      flowID: battleSDK.flowID,
      hostPlayer: battleSDK.player,
      guestPlayer: battleSDK.enemy,
      update: battleSDK.initialState,
    });
    return battleSDK;
  }

  /**
   * シグナリングを行う
   * @returns シグナリングが完了したら発火するPromise
   */
  async #signaling() {
    let unSubscribers: Unsubscribable[] = [];
    try {
      await this.#frontendLog.log({
        type: "SIGNALING_START",
        spanId: this.#spanId,
      });

      const websocket = await this.#websocketConnection.getOrCreate();
      const signalingID = await waitUntilMatching(websocket);
      const { connection, dataChannel } =
        await this.#webRTCConnection.getOrCreateConnection();

      // オファー開始直後にイベント発火することがあるので、
      // あらじめイベント購読をする
      unSubscribers = [
        notifyIceCandidateReceived(websocket).subscribe((iceCandidate) => {
          connection.addIceCandidate(iceCandidate);
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
      sendToWSSignal(websocket, {
        action: "send-sdp",
        signalingID,
        sdp,
      });
      const remoteSDP = await waitUntilSDPReceive(websocket);
      await Promise.all([
        connection.setLocalDescription(sdp),
        connection.setRemoteDescription(remoteSDP),
        waitUntilConnected(connection),
        waitUntilDataChannelOpen(dataChannel),
      ]);

      await this.#frontendLog.log({
        type: "SIGNALING_END",
        spanId: this.#spanId,
      });
    } finally {
      unSubscribers.forEach((u) => u.unsubscribe());
      this.#websocketConnection.gracefulDisconnect();
    }
  }
}
