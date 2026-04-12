/** 接続中 */
type Connected = {
  type: "connected";
  /** WebRTCコネクション */
  connection: RTCPeerConnection;
  /** データチャンネル */
  dataChannel: RTCDataChannel;
};

/** 切断中 */
type Disconnected = {
  type: "disconnected";
};

/** コネクションの状態 */
type ConnectionState = Connected | Disconnected;

/** ホストのWebRTCコネクション管理 */
export class HostWebRTCConnectionManager {
  /** コネクションの状態 */
  #connectionState: ConnectionState = { type: "disconnected" };
  /** WebRTCヘルパーAPIのURL */
  #webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  #coturnDomainName: string;

  /**
   * コンストラクタ
   * @param options オプション
   * @param options.webRTCHelperApiURL WebRTCヘルパーAPIのURL
   * @param options.coturnDomainName coturnサーバーのドメイン名
   */
  constructor(options: {
    /** WebRTCヘルパーAPIのURL */
    webRTCHelperApiURL: string;
    /** coturnサーバーのドメイン名 */
    coturnDomainName: string;
  }) {
    this.#webRTCHelperApiURL = options.webRTCHelperApiURL;
    this.#coturnDomainName = options.coturnDomainName;
  }

  /**
   * コネクションを取得する。
   * コネクションが存在しない場合は新たに作成する。
   * @returns 取得したコネクションとデータチャンネル
   */
  getOrCreateConnection(): {
    /** コネクション */
    connection: RTCPeerConnection;
    /** データチャンネル */
    dataChannel: RTCDataChannel;
  } {
    if (this.#connectionState.type === "disconnected") {
      const connection = new RTCPeerConnection();
      const dataChannel = connection.createDataChannel("sendDataChannel");
      this.#connectionState = {
        type: "connected",
        connection,
        dataChannel,
      };
    }

    return this.#connectionState;
  }

  /**
   * コネクションを切断する
   */
  disconnect() {
    if (this.#connectionState.type === "connected") {
      this.#connectionState.connection.close();
      this.#connectionState.dataChannel.close();
    }
    this.#connectionState = { type: "disconnected" };
  }
}
