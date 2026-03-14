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
  /** 接続中のWebSocket、接続されていない場合はnull */
  #websocket: WebSocket | null = null;

  /**
   * コンストラクタ
   * @param wsSignalUrl WebSocketシグナルサーバーのURL
   */
  constructor(wsSignalUrl: string) {
    this.#wsSignalUrl = wsSignalUrl;
  }
}
