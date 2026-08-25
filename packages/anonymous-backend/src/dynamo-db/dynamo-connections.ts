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

  /**
   * Put操作を行う
   * @param connection 追加する項目
   * @returns 処理が完了したら発火するPromise
   */
  async put(connection: DynamoConnection): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: connection,
    });
  }

  /**
   * Delete操作を行う
   * 削除対象が存在しない場合は何もせずにnullを返す
   * @param connectionId コネクションID
   * @returns 削除対象が存在した場合は削除されたアイテム、存在しない場合はnull
   */
  async delete(connectionId: string): Promise<DynamoConnection | null> {
    const result = await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: { connectionId },
      ReturnValues: "ALL_OLD",
    });
    const parsed = DynamoConnectionSchema.safeParse(result.Attributes);
    return parsed.success ? parsed.data : null;
  }
}
