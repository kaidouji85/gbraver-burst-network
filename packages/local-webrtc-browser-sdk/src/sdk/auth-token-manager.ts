import { issueAuthToken } from "../http-api/issue-auth-token";

/** 認証トークン */
export type AuthToken = {
  /** トークン文字列 */
  token: string;
  /** トークンの有効期限（Unix時間） */
  expiresAt: number;
};

/**
 * トークン再利用のしきい値（秒）
 * 残り有効時間がこの値以下になったら、再利用せず再発行する
 */
const TOKEN_REUSE_CUTOFF_SECONDS = 60 * 5;

/**
 * トークンを再利用できるか判定する
 * 残り有効時間がしきい値より長い場合のみ、再利用可能とする
 * @param authToken 認証トークン
 * @returns 判定結果、再利用可能ならtrue、トークンの再発行が必要ならfalse
 */
const canReuseToken = (authToken: AuthToken): boolean => {
  const now = Date.now() / 1000;
  return now < authToken.expiresAt - TOKEN_REUSE_CUTOFF_SECONDS;
};

/** 認証トークンマネージャー */
export interface AuthTokenManager {
  /**
   * 認証トークンを取得する（必要なら再発行する）
   * キャッシュ済みトークンが再利用可能ならそれを返し、
   * そうでなければ新しいトークンを発行して返す
   * @returns 認証トークン
   */
  getOrIssueAuthToken(): Promise<AuthToken>;
}

/** 認証トークンマネージャーの実装 */
class AuthTokenManagerImpl implements AuthTokenManager {
  /** WebRTCヘルパーAPIのURL */
  #webRTCHelperApiURL: string;
  /** 認証トークンPromise、未発行時はnull */
  #authTokenPromise: Promise<AuthToken> | null = null;

  /**
   * コンストラクタ
   * @param webRTCHelperApiURL WebRTCヘルパーAPIのURL
   */
  constructor(webRTCHelperApiURL: string) {
    this.#webRTCHelperApiURL = webRTCHelperApiURL;
  }

  /** @override */
  getOrIssueAuthToken(): Promise<AuthToken> {
    if (this.#authTokenPromise === null) {
      this.#authTokenPromise = this.#issueAuthTokenWithReset();
      return this.#authTokenPromise;
    }

    this.#authTokenPromise = this.#authTokenPromise.then((token) => {
      return canReuseToken(token) ? token : this.#issueAuthTokenWithReset();
    });
    return this.#authTokenPromise;
  }

  /**
   * 認証トークンを発行する
   * 失敗した場合はキャッシュをクリアし、次回呼び出しで再試行できるようにする
   * @return 発行した認証トークン
   */
  #issueAuthTokenWithReset(): Promise<AuthToken> {
    return issueAuthToken(this.#webRTCHelperApiURL).catch((error: unknown) => {
      this.#authTokenPromise = null;
      throw error;
    });
  }
}

/**
 * 認証トークンマネージャーを生成する
 * @param webRTCHelperApiURL WebRTCヘルパーAPIのURL
 * @returns 生成した認証トークンマネージャー
 */
export const createAuthTokenManager = (
  webRTCHelperApiURL: string,
): AuthTokenManager => {
  return new AuthTokenManagerImpl(webRTCHelperApiURL);
};
