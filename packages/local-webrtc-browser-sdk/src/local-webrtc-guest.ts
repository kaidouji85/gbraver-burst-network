import { connectWebSocket } from "./websocket/connect-web-socket";

/** ローカルWebRTCゲスト */
export type LocalWebRTCBrowserSDK = {
  /**
   * ルームに参加する
   * @param roomID ルームID
   * @returns ルームへの参加に成功したらtrue、失敗したらfalse
   */
  joinRoom: (roomID: string) => Promise<boolean>;
};

/** ローカルWebRTCゲストの実装 */
class LocalWebRTCBrowserSDKImpl implements LocalWebRTCBrowserSDK {
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
    this.#websocket = await connectWebSocket(this.#wsSignalUrl);
    this.#websocket.close();

    // TODO ロジックを作る
    return true;
  }
}

/**
 * ローカルWebRTCゲストを生成する
 * @param wsSignalUrl WebSocketシグナルサーバーのURL
 * @returns ローカルWebRTCゲストのインスタンス
 */
export function createLocalWebRTCBrowserSDK(
  wsSignalUrl: string,
): LocalWebRTCBrowserSDK {
  return new LocalWebRTCBrowserSDKImpl(wsSignalUrl);
}
