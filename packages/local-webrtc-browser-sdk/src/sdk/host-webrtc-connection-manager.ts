import { issueCoturnCredential } from "../webrtc-helper/issue-coturn-credential";

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
   * @returns 取得したコネクションとデータチャンネル
   */
  async getOrCreateConnection(): Promise<{
    /** コネクション */
    connection: RTCPeerConnection;
    /** データチャンネル */
    dataChannel: RTCDataChannel;
  }> {
    if (this.#connectionState.type === "disconnected") {
      const { username, password: credential } = await issueCoturnCredential(
        this.#webRTCHelperApiURL,
      );
      const connection = new RTCPeerConnection({
        iceServers: [
          {
            urls: [`stun:${this.#coturnDomainName}:3478`],
          },
          {
            urls: [
              `turn:${this.#coturnDomainName}:3478?transport=udp`,
              `turn:${this.#coturnDomainName}:3478?transport=tcp`,
              `turns:${this.#coturnDomainName}:5349?transport=tcp`,
            ],
            username,
            credential,
          },
        ],
      });
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
