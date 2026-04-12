import { createRTCPeerConnection } from "./create-rtc-peer-connection";

/** 接続中 */
type Connected = {
  type: "connected";
  /** WebRTCコネクションのPromise */
  connectionPromise: Promise<RTCPeerConnection>;
  /** データチャンネルのPromise */
  dataChannelPromise: Promise<RTCDataChannel>;
};

/** 切断中 */
type Disconnected = {
  type: "disconnected";
};

/** コネクションの状態 */
type ConnectionState = Connected | Disconnected;

/** HostWebRTCConnectionManagerコンストラクタのオプション */
export type HostWebRTCConnectionManagerOptions = {
  /** WebRTCヘルパーAPIのURL */
  webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  coturnDomainName: string;
};

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
   */
  constructor(options: HostWebRTCConnectionManagerOptions) {
    this.#webRTCHelperApiURL = options.webRTCHelperApiURL;
    this.#coturnDomainName = options.coturnDomainName;
  }

  /**
   * コネクションを取得する。
   * コネクションが存在しない場合は新たに作成する。
   * @returns 生成したコネクション
   */
  getOrCreateConnection(): {
    /** コネクションのPromise */
    connectionPromise: Promise<RTCPeerConnection>;
    /** データチャンネルのPromise */
    dataChannelPromise: Promise<RTCDataChannel>;
  } {
    if (this.#connectionState.type === "disconnected") {
      const connectionPromise = createRTCPeerConnection({
        webRTCHelperApiURL: this.#webRTCHelperApiURL,
        coturnDomainName: this.#coturnDomainName,
      });
      const dataChannelPromise = connectionPromise.then((connection) =>
        connection.createDataChannel("sendDataChannel"),
      );
      this.#connectionState = {
        type: "connected",
        connectionPromise,
        dataChannelPromise,
      };
    }

    return this.#connectionState;
  }

  /**
   * コネクションを切断する
   */
  disconnect() {
    if (this.#connectionState.type === "connected") {
      this.#connectionState.connectionPromise.then((connection) => {
        connection.close();
      });
      this.#connectionState.dataChannelPromise.then((dataChannel) => {
        dataChannel.close();
      });
    }
    this.#connectionState = { type: "disconnected" };
  }
}
