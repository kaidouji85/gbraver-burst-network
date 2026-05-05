import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { createHash } from "crypto";
import { z } from "zod";

/** トークンの有効期限（秒） */
export const AUTH_TOKEN_TTL = 60 * 10;

/**
 * DynamoDBスキーマ AuthToken
 * パーティションキー hashToken
 */
export type DynamoAuthToken = {
  /** ハッシュ化されたトークン */
  tokenHash: string;
  /** トークンの有効期限（Unixタイムスタンプ） */
  expiresAt: number;
};

/** DynamoDBスキーマ AuthToken */
export const DynamoAuthTokenSchema = z.object({
  tokenHash: z.string(),
  expiresAt: z.number(),
});

/** AuthTokens の DAO */
export class DynamoAuthTokens {
  /** DynamoDBDocument */
  #dynamoDB: DynamoDBDocument;
  /** DynamoDB テーブル名 */
  #tableName: string;

  /**
   * コンストラクタ
   * @param dynamoDB DynamoDBDocument
   * @param tableName テーブル名
   */
  constructor(dynamoDB: DynamoDBDocument, tableName: string) {
    this.#dynamoDB = dynamoDB;
    this.#tableName = tableName;
  }

  /**
   * トークンをSHA-256でハッシュ化する
   * @param token 元のトークン
   * @returns ハッシュ化されたトークン（hex文字列）
   */
  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async put(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const expiresAt = Date.now() / 1000 + AUTH_TOKEN_TTL;
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: { tokenHash, expiresAt },
    });
  }
}
