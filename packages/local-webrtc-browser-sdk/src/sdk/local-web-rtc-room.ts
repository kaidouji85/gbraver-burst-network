import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilMatching } from "../ws-signal/wait-until-matching";
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
  /** WebSocketコネクションマネージャー */
  #websocketManager: WebSocketConnectionManager;
  /** WebRTCコネクション */
  #connection: RTCPeerConnection;

  /**
   * コンストラクタ
   * @param options ルームの生成に必要なオプション
   * @param options.roomID ルームID
   * @param options.websocket WebSocketコネクション
   * @param options.connection WebRTCコネクション
   */
  constructor(options: {
    roomID: string;
    websocketManager: WebSocketConnectionManager;
    connection: RTCPeerConnection;
  }) {
    const { roomID, websocketManager, connection } = options;
    this.roomID = roomID;
    this.#websocketManager = websocketManager;
    this.#connection = connection;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<void> {
    try {
      const websocket = await this.#websocketManager.getOrCreate();
      const signal = await waitUntilMatching(websocket);
      await this.#connection.setRemoteDescription(signal.sdp);
      await Promise.all([
        ...signal.iceCandidates.map((c) => this.#connection.addIceCandidate(c)),
      ]);
      await waitUntilConnected(this.#connection);
    } finally {
      this.#websocketManager.gracefulDisconnect();
    }
  }
}
