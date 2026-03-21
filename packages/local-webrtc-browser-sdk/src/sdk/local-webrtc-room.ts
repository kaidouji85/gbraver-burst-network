import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { nanoid } from "nanoid";

import { requestSelectedPlayer } from "../webrtc/host/request-selected-player";
import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilDataChannelOpen } from "../webrtc/wait-until-data-channel-ready";
import { waitUntilMatching } from "../ws-signal/wait-until-matching";
import { HostBattleSDK } from "./host-battle-sdk";
import { HostWebRTCConnectionManager } from "./host-webrtc-connection-manager";
import { WebSocketConnectionManager } from "./websocket-connection-manager";

/** ローカルWebRTC ルーム */
export type LocalWebRTCRoom = {
  /** ルームID */
  readonly roomID: string;

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  waitUntilMatching: () => Promise<void>;
};

/** ローカルWebRTCルームの実装 */
export class LocalWebRTCRoomImpl implements LocalWebRTCRoom {
  /** ルームID */
  roomID: string;
  /** WebRTCコネクションマネージャー */
  #webRTCConnection: HostWebRTCConnectionManager;
  /** WebSocketコネクションマネージャー */
  #websocketConnection: WebSocketConnectionManager;
  /** ホストが選択したアームドーザID */
  #hostArmdozerId: ArmdozerId;
  /** ホストが選択したパイロットID */
  #hostPilotId: PilotId;

  /**
   * コンストラクタ
   * @param options ルームの生成に必要なオプション
   * @param options.roomID ルームID
   * @param options.webRTCConnection WebRTCコネクションマネジャー
   * @param options.websocketConnection WebSocketコネクションマネジャー
   */
  constructor(options: {
    roomID: string;
    webRTCConnection: HostWebRTCConnectionManager;
    websocketConnection: WebSocketConnectionManager;
    hostArmdozerId: ArmdozerId;
    hostPilotId: PilotId;
  }) {
    const {
      roomID,
      webRTCConnection,
      websocketConnection,
      hostArmdozerId,
      hostPilotId,
    } = options;
    this.roomID = roomID;
    this.#webRTCConnection = webRTCConnection;
    this.#websocketConnection = websocketConnection;
    this.#hostArmdozerId = hostArmdozerId;
    this.#hostPilotId = hostPilotId;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<void> {
    await this.#signaling();
    const { dataChannel } = this.#webRTCConnection.getOrCreateConnection();
    const flowID = nanoid();
    const { armdozerId: guestArmdozerId, pilotId: guestPilotId } =
      await requestSelectedPlayer(dataChannel, flowID);
    const battleSDK = new HostBattleSDK({
      hostArmdozerId: this.#hostArmdozerId,
      hostPilotId: this.#hostPilotId,
      guestArmdozerId,
      guestPilotId,
    });
  }

  /**
   * シグナリングを行う
   * @returns シグナリングが完了したら発火するPromise
   */
  async #signaling() {
    try {
      const websocket = await this.#websocketConnection.getOrCreate();
      const signal = await waitUntilMatching(websocket);
      const { connection, dataChannel } =
        this.#webRTCConnection.getOrCreateConnection();
      await connection.setRemoteDescription(signal.sdp);
      await Promise.all([
        ...signal.iceCandidates.map((c) => connection.addIceCandidate(c)),
      ]);
      await Promise.all([
        waitUntilConnected(connection),
        waitUntilDataChannelOpen(dataChannel),
      ]);
    } finally {
      this.#websocketConnection.gracefulDisconnect();
    }
  }
}
