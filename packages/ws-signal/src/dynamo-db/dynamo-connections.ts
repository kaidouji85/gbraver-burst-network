import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { Connection, ConnectionSchema } from "../core/connection";

/**
 * DynamoDB スキーマ connections
 * パーティションキー connectionId
 */
export type DynamoConnection = Connection;

/** DynamoConnections zodスキーマ */
export const DynamoConnectionSchema = ConnectionSchema;

/** DynamoDB connections の DAO */
export class DynamoConnections {
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
}
