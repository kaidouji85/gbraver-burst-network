import { Signal } from "../webrtc/signal";
import { waitUntilConnected } from "../webrtc/wait-until-connected";
import { waitUntilMatching } from "../ws-signal/wait-until-matching";

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
  /** WebSocketコネクション */
  #websocket: WebSocket;
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
    websocket: WebSocket;
    connection: RTCPeerConnection;
  }) {
    const { roomID, websocket } = options;
    this.roomID = roomID;
    this.#websocket = websocket;
    this.#connection = options.connection;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<void> {
    await Promise.all([
      waitUntilConnected(this.#connection),
      waitUntilMatching(this.#websocket),
    ]);
  }
}
