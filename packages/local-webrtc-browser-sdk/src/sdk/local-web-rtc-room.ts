import { Signal } from "../webrtc/signal";
import { waitUntilMatching } from "../ws-signal/wait-until-matching";

/** ローカルWebRTC ルーム */
export type LocalWebRTCRoom = {
  /** ルームID */
  readonly roomID: string;

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  waitUntilMatching: () => Promise<Signal>;
};

/** ローカルWebRTCルームの実装 */
export class LocalWebRTCRoomImpl implements LocalWebRTCRoom {
  /** ルームID */
  roomID: string;
  /** WebSocketコネクション */
  #websocket: WebSocket;

  /**
   * コンストラクタ
   * @param roomID ルームID
   * @param websocket WebSocketコネクション
   */
  constructor(roomID: string, websocket: WebSocket) {
    this.roomID = roomID;
    this.#websocket = websocket;
  }

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  async waitUntilMatching(): Promise<Signal> {
    return await waitUntilMatching(this.#websocket);
  }
}
