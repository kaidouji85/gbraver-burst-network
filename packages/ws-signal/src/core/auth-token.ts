import { nanoid } from "nanoid";
import { z } from "zod";

/** 認証用トークン */
export type AuthToken = {
  /** トークン文字列 */
  token: string;
  /** トークンの有効期限（Unix時間） */
  expiresAt: number;
};

/** AuthToken zodスキーマ */
export const AuthTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
});

/**
 * ハッシュ化された認証用トークン
 */
export type HashAuthToken = {
  /** ハッシュ化されたトークン */
  tokenHash: string;
  /** トークンの有効期限（Unixタイムスタンプ） */
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

/**
 * AuthorizationヘッダーからBearerトークンを抽出する
 * Rest API用のオーソライザーでは、以下フォーマットでのAuthorizationヘッダーを想定している
 * Authorization: Bearer <token>
 * @param authorization Authorizationヘッダーの値
 * @returns Bearerトークン、不正なフォーマットの場合はnull
 */
export const extractBearerToken = (authorization: string) => {
  const parts = authorization.split(/\s+/);
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
};
