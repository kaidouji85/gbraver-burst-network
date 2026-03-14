import { connectWebSocket } from "./websocket/connect-web-socket";

/** ローカルWebRTCホスト */
export type LocalWebRTCHost = {
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

/** ローカルWebRTCホストの実装 */
class LocalWebRTCHostImpl implements LocalWebRTCHost {
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
    this.#websocket = await connectWebSocket(this.#wsSignalUrl);
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
 * ローカルWebRTCホストを生成する
 * @param wsSignalUrl WebSocketシグナルサーバーのURL
 * @returns ローカルWebRTCホストのインスタンス
 */
export function createLocalWebRTCHost(wsSignalUrl: string): LocalWebRTCHost {
  return new LocalWebRTCHostImpl(wsSignalUrl);
}
