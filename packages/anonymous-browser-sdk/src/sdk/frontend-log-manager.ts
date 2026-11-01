import { isAbortError } from "../abort-controller/abort-error";
import { SignalContainer } from "../abort-controller/signal-container";
import { frontendLog } from "../http-api/frontend-log";
import { FrontendLog } from "../http-api/request/frontend-log";
import { AuthTokenManager } from "./auth-token-manager";

/** フロントエンドログマネージャー */
export class FrontendLogManager {
  /** 認証トークンマネージャー */
  #authToken: AuthTokenManager;
  /** 匿名バックエンドREST APIのURL */
  #anonymousBackendApiURL: string;

  /**
   * コンストラクタ
   * @param options コンストラクタのオプション
   * @param options.anonymousBackendApiURL 匿名バックエンドREST APIのURL
   * @param options.authTokenManager 認証トークンマネージャー
   */
  constructor(options: {
    anonymousBackendApiURL: string;
    authToken: AuthTokenManager;
  }) {
    this.#authToken = options.authToken;
    this.#anonymousBackendApiURL = options.anonymousBackendApiURL;
  }

  /**
   * フロントエンドログを送信する
   * ログの失敗で以降の処理を止めるべきではないため、
   * AbortError以外の例外は握りつぶしてfalseを返す
   * @param body ログ内容
   * @param options オプション
   * @param options.signal アボートシグナル
   * @returns ログ送信結果、成功ならtrue
   */
  async log(
    body: FrontendLog,
    options?: Partial<SignalContainer>,
  ): Promise<boolean> {
    try {
      const signal = options?.signal;
      const authToken = await this.#authToken.getOrIssueAuthToken({ signal });
      return await frontendLog({
        apiURL: this.#anonymousBackendApiURL,
        authToken: authToken.token,
        body,
        signal,
      });
    } catch (e) {
      if (isAbortError(e)) {
        throw e;
      }
      return false;
    }
  }
}
