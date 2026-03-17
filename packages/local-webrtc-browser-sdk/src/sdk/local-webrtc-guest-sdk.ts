import { connectWSSignal } from "../ws-signal/connect-ws-signal";
import { joinRoom } from "../ws-signal/join-room";

/** ローカルWebRTCゲスト用SDK */
export type LocalWebRTCGuestSDK = {
  /**
   * ルームに参加する
   * @param roomID ルームID
   * @returns ルームへの参加に成功したらtrue、失敗したらfalse
   */
  joinRoom: (roomID: string) => Promise<boolean>;
};

/** ローカルWebRTCゲスト用SDKの実装 */
class LocalWebRTCGuestSDKImpl implements LocalWebRTCGuestSDK {
  /** WebSocketシグナルサーバーのURL */
  #wsSignalUrl: string;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#wsSignalUrl = wsSignalUrl;
  }

  /** @override */
  async joinRoom(roomID: string) {
    const websocket = await connectWSSignal(this.#wsSignalUrl);
    const joinRoomAccepted = await joinRoom({ websocket, roomID });
    if (!joinRoomAccepted) {
      websocket.close();
      return false;
    }

    return true;
  }
}

/**
 * ローカルWebRTCゲスト用SDKを生成する
 * @param wsSignalUrl WebSocketシグナルサーバーのURL
 * @returns ローカルWebRTCゲスト用SDKのインスタンス
 */
export function createLocalWebRTCGuestSDK(
  wsSignalUrl: string,
): LocalWebRTCGuestSDK {
  return new LocalWebRTCGuestSDKImpl(wsSignalUrl);
}
