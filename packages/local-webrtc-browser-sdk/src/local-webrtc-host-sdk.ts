import { connectWSSignal } from "./ws-signal/connect-ws-signal";

/** ローカルWebRTCホスト用SDK */
export type LocalWebRTCHostSDK = {
  /**
   * ルームを生成する
   * @returns 生成されたルームのID、生成に失敗した場合はnull
   */
  createRoom: () => Promise<string | null>;

  /**
   * マッチングするまで待機する
   * @returns マッチングしたら発火するPromise
   */
  waitUntilMatching: () => Promise<void>;
};

/** ローカルWebRTCホスト用SDKの実装 */
class LocalWebRTCHostSDKImpl implements LocalWebRTCHostSDK {
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
  async createRoom() {
    this.#websocket = await connectWSSignal(this.#wsSignalUrl);
    // TODO ロジックを作る
    return "";
  }

  /** @override */
  async waitUntilMatching() {
    if (!this.#websocket) {
      return;
    }

    // TODO ロジックを作る
    this.#websocket.close();
  }
}

/**
 * ローカルWebRTCホスト用SDKを生成する
 * @param wsSignalUrl WebSocketシグナルサーバーのURL
 * @returns ローカルWebRTCホスト用SDKのインスタンス
 */
export function createLocalWebRTCHostSDK(
  wsSignalUrl: string,
): LocalWebRTCHostSDK {
  return new LocalWebRTCHostSDKImpl(wsSignalUrl);
}
