import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilMatching } from "../ws-signal/wait-until-matching";
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
  #websocketManager: WebSocketConnectionManager;

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
  }) {
    const {
      roomID,
      webRTCConnection,
      websocketConnection: websocketManager,
    } = options;
    this.roomID = roomID;
    this.#webRTCConnection = webRTCConnection;
    this.#websocketManager = websocketManager;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<void> {
    await this.#signaling();
    const {dataChannel} = this.#webRTCConnection.getOrCreateConnection();
  }

  /**
   * シグナリングを行う
   * @returns シグナリングが完了したら発火するPromise
   */
  async #signaling() {
    try {
      const websocket = await this.#websocketManager.getOrCreate();
      const signal = await waitUntilMatching(websocket);
      const { connection } = this.#webRTCConnection.getOrCreateConnection();
      await connection.setRemoteDescription(signal.sdp);
      await Promise.all([
        ...signal.iceCandidates.map((c) => connection.addIceCandidate(c)),
      ]);
      await waitUntilConnected(connection);
    } finally {
      this.#websocketManager.gracefulDisconnect();
    }
  }
}
