import { z } from "zod";

/**
 * DynamoDBスキーマ AuthToken
 * パーティションキー hashToken
 */
export type DynamoAuthToken = {
  /** ハッシュ化されたトークン */
  hashToken: string;
  /** トークンの有効期限（Unixタイムスタンプ） */
  expiresAt: number;
};

/** DynamoDBスキーマ AuthToken */
export const DynamoAuthTokenSchema = z.object({
  hashToken: z.string(),
  expiresAt: z.number(),
});
