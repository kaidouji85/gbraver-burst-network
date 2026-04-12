import { waitUntilDataChannel } from "../webrtc/guest/wait-until-data-channel";

/** 接続中 */
type Connected = {
  type: "connected";
  /** WebRTCコネクション */
  connection: RTCPeerConnection;
  /** データチャンネル、開通までラグあるためPromiseで保持 */
  dataChannel: Promise<RTCDataChannel>;
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
    connection: RTCPeerConnection;
    /** データチャンネル */
    dataChannel: Promise<RTCDataChannel>;
  } {
    if (this.#connectionState.type === "disconnected") {
      const connection = new RTCPeerConnection();
      const dataChannel = waitUntilDataChannel(connection);
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
      this.#connectionState.dataChannel.then((channel) => channel.close());
    }
    this.#connectionState = { type: "disconnected" };
  }
}
