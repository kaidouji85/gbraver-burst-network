import { z } from "zod";

/** 認証トークン発行レスポンス */
export type IssueAuthTokenResponse = {
  /** トークン文字列 */
  token: string;
  /** トークンの有効期限（Unix時間） */
  expiresAt: number;
};

/** IssueAuthTokenResponse zodスキーマ */
export const IssueAuthTokenResponseSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
});
