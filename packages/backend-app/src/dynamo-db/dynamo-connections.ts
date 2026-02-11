import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { Connection, ConnectionSchema } from "../core/connection";

/** userID の GSI 名 */
const USER_ID_INDEX = "userID";

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
   * @returns 検索結果
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
   * @returns 処理が完了したら発火するPromise
   */
  async put(connection: DynamoConnection): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: connection,
    });
  }

  /**
   * userID で GSI をクエリして該当接続を取得する
   * @param userID ユーザID
   * @returns 該当する Connection 配列（未存在は空配列）
   */
  async queryByUserID(userID: string): Promise<DynamoConnection[]> {
    const result = await this.#dynamoDB.query({
      TableName: this.#tableName,
      IndexName: USER_ID_INDEX,
      KeyConditionExpression: "userID = :uid",
      ExpressionAttributeValues: { ":uid": userID },
    });
    const items = result.Items ?? [];
    return items.map((it) => DynamoConnectionSchema.parse(it));
  }

  /**
   * gbraver_burst_connectionの項目を削除する
   * @param connectionId コネクションID
   * @returns 項目削除が完了したら発火するPromise
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
