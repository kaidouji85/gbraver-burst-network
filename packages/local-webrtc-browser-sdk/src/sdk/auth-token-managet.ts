import { issueAuthToken } from "../webrtc-helper/issue-auth-token";

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

/** 認証トークン管理クラス */
export class AuthTokenManager {
  /** WebRTCヘルパーAPIのURL */
  #webRTCHelperApiURL: string;
  /** 認証トークン */
  #authToken: AuthToken | null = null;

  /**
   * コンストラクタ
   * @param webRTCHelperApiURL WebRTCヘルパーAPIのURL
   */
  constructor(webRTCHelperApiURL: string) {
    this.#webRTCHelperApiURL = webRTCHelperApiURL;
  }

  /**
   * 認証トークンを取得する（必要なら再発行する）
   * キャッシュ済みトークンが再利用可能ならそれを返し、
   * そうでなければ新しいトークンを発行して返す
   * @returns 認証トークン
   */
  async getOrIssueAuthToken(): Promise<AuthToken> {
    if (this.#authToken && canReuseToken(this.#authToken)) {
      return this.#authToken;
    }

    const resp = await issueAuthToken(this.#webRTCHelperApiURL);
    this.#authToken = resp;
    return this.#authToken;
  }
}
