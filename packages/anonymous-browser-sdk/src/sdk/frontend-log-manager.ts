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
   * ログの失敗で以降の処理を止めるべきではないため、例外は握りつぶしてfalseを返す
   * @param body ログ内容
   * @returns ログ送信結果、成功ならtrue
   */
  async log(body: FrontendLog): Promise<boolean> {
    try {
      const authToken = await this.#authToken.getOrIssueAuthToken();
      return await frontendLog({
        apiURL: this.#webRTCHelperApiURL,
        authToken: authToken.token,
        body,
      });
    } catch {
      return false;
    }
  }
}
