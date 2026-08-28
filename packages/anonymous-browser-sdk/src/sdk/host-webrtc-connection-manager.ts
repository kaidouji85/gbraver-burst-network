import { AuthTokenManager } from "./auth-token-manager";
import { createRTCPeerConnection } from "./create-rtc-peer-connection";

/** コネクション情報 */
type Connection = {
  /** WebRTCコネクション */
  connection: RTCPeerConnection;
  /** データチャンネル */
  dataChannel: RTCDataChannel;
};

/** HostWebRTCConnectionManagerコンストラクタのオプション */
export type HostWebRTCConnectionManagerOptions = {
  /** 認証トークンマネージャー */
  authToken: AuthTokenManager;
  /** WebRTCヘルパーAPIのURL */
  webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  coturnDomainName: string;
};

/** ホストのWebRTCコネクション管理 */
export class HostWebRTCConnectionManager {
  /** 認証トークンマネージャー */
  #authToken: AuthTokenManager;
  /** コネクション情報、nullで未接続 */
  #connection: Promise<Connection> | null = null;
  /** WebRTCヘルパーAPIのURL */
  #webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  #coturnDomainName: string;

  /**
   * コンストラクタ
   * @param options オプション
   */
  constructor(options: HostWebRTCConnectionManagerOptions) {
    this.#authToken = options.authToken;
    this.#webRTCHelperApiURL = options.webRTCHelperApiURL;
    this.#coturnDomainName = options.coturnDomainName;
  }

  /**
   * コネクションを取得する。
   * コネクションが存在しない場合は新たに作成する。
   * @returns 生成したコネクション
   */
  getOrCreateConnection(): Promise<Connection> {
    if (this.#connection) {
      return this.#connection;
    }

    this.#connection = (async () => {
      const authToken = await this.#authToken.getOrIssueAuthToken();
      const connection = await createRTCPeerConnection({
        webRTCHelperApiURL: this.#webRTCHelperApiURL,
        coturnDomainName: this.#coturnDomainName,
        authToken: authToken.token,
      });
      const dataChannel = connection.createDataChannel("sendDataChannel");
      return { connection, dataChannel };
    })().catch((err) => {
      this.#connection = null;
      throw err;
    });
    return this.#connection;
  }

  /**
   * コネクションを切断する
   */
  disconnect() {
    if (!this.#connection) {
      return;
    }

    this.#connection.then(({ connection, dataChannel }) => {
      connection.close();
      dataChannel.close();
    });
    this.#connection = null;
  }
}
