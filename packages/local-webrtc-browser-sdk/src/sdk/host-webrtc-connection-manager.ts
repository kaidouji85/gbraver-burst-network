import { createRTCPeerConnection } from "./create-rtc-peer-connection";

/** 接続中 */
type Connected = {
  type: "connected";
  /**
   * コネクションPromise
   * コネクションの重複作成を防ぐために、コネクションとデータチャンネルのセットをPromiseで保持する
   */
  connectionPromise: Promise<{
    /** WebRTCコネクション */
    connection: RTCPeerConnection;
    /** データチャンネル */
    dataChannel: RTCDataChannel;
  }>;
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
      const connectionPromise = this.#createConnectionPromise();
      this.#connectionState = {
        type: "connected",
        connectionPromise,
      };
    }

    return await this.#connectionState.connectionPromise;
  }

  /**
   * コネクションを切断する
   */
  disconnect() {
    if (this.#connectionState.type === "connected") {
      this.#connectionState.connectionPromise.then(
        ({ connection, dataChannel }) => {
          connection.close();
          dataChannel.close();
        },
      );
    }
    this.#connectionState = { type: "disconnected" };
  }

  /**
   * コネクションPromiseを生成する
   * @returns コネクションPromise
   */
  async #createConnectionPromise() {
    const connection = await createRTCPeerConnection({
      webRTCHelperApiURL: this.#webRTCHelperApiURL,
      coturnDomainName: this.#coturnDomainName,
    });
    const dataChannel = connection.createDataChannel("sendDataChannel");
    return { connection, dataChannel };
  }
}
