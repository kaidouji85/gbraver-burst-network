import { connectWSSignal } from "./ws-signal/connect-ws-signal";

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
   * 接続中のWebSocket、接続されていない場合はnull
   * シグナリングの時だけ接続されている想定
   */
  #websocket: WebSocket | null = null;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#wsSignalUrl = wsSignalUrl;
  }

  /** @override */
  async joinRoom() {
    this.#websocket = await connectWSSignal(this.#wsSignalUrl);
    this.#websocket.close();

    // TODO ロジックを作る
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
