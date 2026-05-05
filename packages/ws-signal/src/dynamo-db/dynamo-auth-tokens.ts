import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { createHash } from "crypto";
import { z } from "zod";

/** トークンの有効期限（秒） */
const AUTH_TOKEN_TTL = 60 * 10;

/**
 * トークンをハッシュ化する
 * @param token トークン
 * @returns ハッシュ化したトークン
 */
const toTokenHash = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

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
   * トークンを保存する
   * @param token トークン
   * @returns 処理が完了したら発火するPromise
   */
  async put(token: string): Promise<void> {
    const tokenHash = toTokenHash(token);
    const expiresAt = Date.now() / 1000 + AUTH_TOKEN_TTL;
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: { tokenHash, expiresAt },
    });
  }

  /**
   * 指定したトークンがDynamoDB内に存在するかを検索する
   * @param token トークン
   * @returns 検索結果、存在する場合はハッシュ化したトークン、存在しない場合はnullを返す
   */
  async get(token: string): Promise<DynamoAuthToken | null> {
    const tokenHash = toTokenHash(token);
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: { tokenHash },
      ConsistentRead: true,
    });
    return result ? DynamoAuthTokenSchema.parse(result.Item) : null;
  }
}
