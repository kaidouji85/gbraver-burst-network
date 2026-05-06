import { nanoid } from "nanoid";

/** 認証用トークン */
export type AuthToken = {
  /** トークン文字列 */
  token: string;
  /** トークンの有効期限（Unix時間） */
  expiresAt: number;
};

/** 認証用トークンの有効期限（秒） */
export const AUTH_TOKEN_TTL_SECONDS = 60 * 15;

/**
 * 認証用トークンを生成する
 * @return 認証用トークン
 */
export const createAuthToken = () => {
  const token = nanoid();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + AUTH_TOKEN_TTL_SECONDS;
  return { token, expiresAt };
};
