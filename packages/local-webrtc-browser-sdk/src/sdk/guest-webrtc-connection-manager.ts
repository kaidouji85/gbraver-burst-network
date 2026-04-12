import { waitUntilDataChannel } from "../webrtc/guest/wait-until-data-channel";
import { createRTCPeerConnection } from "./create-rtc-peer-connection";

/** 接続中 */
type Connected = {
  type: "connected";
  /** WebRTCコネクションPromise */
  connectionPromise: Promise<RTCPeerConnection>;
  /** データチャンネルPromise */
  dataChannelPromise: Promise<RTCDataChannel>;
};

/** 切断中 */
type Disconnected = {
  type: "disconnected";
};

/** コネクションの状態 */
type ConnectionState = Connected | Disconnected;

/** GuestWebRTCConnectionManagerコンストラクタのオプション */
export type GuestWebRTCConnectionManagerOptions = {
  /** WebRTCヘルパーAPIのURL */
  webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  coturnDomainName: string;
};

/** ゲストのWebRTCコネクション管理 */
export class GuestWebRTCConnectionManager {
  /** コネクションの状態 */
  #connectionState: ConnectionState = { type: "disconnected" };
  /** WebRTCヘルパーAPIのURL */
  #webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  #coturnDomainName: string;

  /** コンストラクタ
   * @param options コンストラクタのオプション名
   */
  constructor(options: GuestWebRTCConnectionManagerOptions) {
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
    connectionPromise: Promise<RTCPeerConnection>;
    /** データチャンネル */
    dataChannelPromise: Promise<RTCDataChannel>;
  } {
    if (this.#connectionState.type === "disconnected") {
      const connectionPromise = createRTCPeerConnection({
        webRTCHelperApiURL: this.#webRTCHelperApiURL,
        coturnDomainName: this.#coturnDomainName,
      });
      const dataChannelPromise = connectionPromise.then((connection) =>
        waitUntilDataChannel(connection),
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
      this.#connectionState.connectionPromise.then((connection) =>
        connection.close(),
      );
      this.#connectionState.dataChannelPromise.then((channel) =>
        channel.close(),
      );
    }
    this.#connectionState = { type: "disconnected" };
  }
}
