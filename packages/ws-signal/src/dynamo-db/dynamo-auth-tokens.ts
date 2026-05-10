import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { createHash } from "crypto";
import { z } from "zod";

import { AuthToken } from "../core/auth-token";

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
   * @param authToken 認証用トークン
   * @returns 処理が完了したら発火するPromise
   */
  async put(authToken: AuthToken): Promise<void> {
    const { token, expiresAt } = authToken;
    const tokenHash = toTokenHash(token);
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: { tokenHash, expiresAt },
    });
  }

  /**
   * トークンに対応するハッシュ化されたトークンを取得する
   * トークンの存在確認、ユーザーの一意の識別などに利用することを想定している
   * @param token トークン文字列
   * @returns 取得結果、トークンが存在しない場合はnull
   */
  async getHashToken(token: string): Promise<DynamoAuthToken | null> {
    const tokenHash = toTokenHash(token);
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: { tokenHash },
      ConsistentRead: true,
    });
    if (!result.Item) {
      return null;
    }

    return DynamoAuthTokenSchema.parse(result.Item);
  }
}
