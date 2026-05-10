import { issueAuthToken } from "../webrtc-helper/issue-auth-token";

/** 認証トークン */
export type AuthToken = {
  /** トークン文字列 */
  token: string;
  /** トークンの有効期限（Unix時間） */
  expiresAt: number;
};

/** 認証トークンの有効期限のマージン（秒） */
const TOKEN_EXPIRY_MARGIN_SECONDS = 60 * 5;

/**
 * 認証トークンが使用可能かどうかを判定する
 * @param authToken 認証トークン
 * @returns 使用可能であればtrue、そうでなければfalse
 */
const isTokenUsable = (authToken: AuthToken): boolean => {
  const now = Date.now() / 1000;
  return TOKEN_EXPIRY_MARGIN_SECONDS < now - authToken.expiresAt;
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
   * 認証トークンを取得する
   * @returns 取得結果
   */
  async getAuthToken(): Promise<AuthToken> {
    if (this.#authToken && isTokenUsable(this.#authToken)) {
      return this.#authToken;
    }

    const resp = await issueAuthToken(this.#webRTCHelperApiURL);
    this.#authToken = resp;
    return this.#authToken;
  }
}
