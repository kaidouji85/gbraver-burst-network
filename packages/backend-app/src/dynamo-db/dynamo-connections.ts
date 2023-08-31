import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { Connection, ConnectionSchema } from "../core/connection";

/**
 * DynamoDB スキーマ connections
 * パーティションキー connectionId
 */
type DynamoConnection = Connection;

/** DynamoConnection zodスキーマ */
const DynamoConnectionSchema = ConnectionSchema;

/** DynamoDB DAO connections */
export class DynamoConnections {
  #dynamoDB: DynamoDBDocument;
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
   * コネクションID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   * @param connectionId コネクションID
   * @return 検索結果
   */
  async get(connectionId: string): Promise<DynamoConnection | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: {
        connectionId,
      },
    });
    return result.Item ? DynamoConnectionSchema.parse(result.Item) : null;
  }

  /**
   * gbraver_burst_connectionに項目追加する
   * @param connection 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(connection: DynamoConnection): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: connection,
    });
  }

  /**
   * gbraver_burst_connectionの項目を削除する
   * @param connectionId コネクションID
   * @return 項目削除が完了したら発火するPromise
   */
  async delete(connectionId: string): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        connectionId,
      },
    });
  }
}
