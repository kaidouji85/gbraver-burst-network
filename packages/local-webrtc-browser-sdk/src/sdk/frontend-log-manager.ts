import { frontendLog } from "../http-api/frontend-log";
import { FrontendLog } from "../http-api/request/frontend-log";
import { AuthTokenManager } from "./auth-token-manager";

/** フロントエンドログマネージャー */
export class FrontendLogManager {
  /** 認証トークンマネージャー */
  #authToken: AuthTokenManager;
  /** WebRTCヘルパーAPIのURL */
  #webRTCHelperApiURL: string;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   * @param options.webRTCHelperApiURL WebRTCヘルパーAPIのURL
   * @param options.authTokenManager 認証トークンマネージャー
   */
  constructor(options: {
    webRTCHelperApiURL: string;
    authToken: AuthTokenManager;
  }) {
    this.#authToken = options.authToken;
    this.#webRTCHelperApiURL = options.webRTCHelperApiURL;
  }

  /**
   * フロントエンドログを送信する
   * @param body ログ内容
   * @returns ログ送信結果、成功ならtrue
   */
  async log(body: FrontendLog): Promise<boolean> {
    const authToken = await this.#authToken.getOrIssueAuthToken();
    return frontendLog({
      apiURL: this.#webRTCHelperApiURL,
      authToken: authToken.token,
      body,
    });
  }
}
