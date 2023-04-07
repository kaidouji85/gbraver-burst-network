import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { Connection } from "../core/connection";

/**
 * connectionsのスキーマ
 * パーティションキー connectionId
 */
export type ConnectionsSchema = Connection;

/** connectionsのDAO */
export class Connections {
  _client: DynamoDBDocument;
  _tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDBDocument, tableName: string) {
    this._client = client;
    this._tableName = tableName;
  }

  /**
   * コネクションID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param connectionId コネクションID
   * @return 検索結果
   */
  async get(connectionId: string): Promise<ConnectionsSchema | null> {
    const result = await this._client.get({
      TableName: this._tableName,
      Key: {
        connectionId,
      },
    });
    return result.Item ? (result.Item as ConnectionsSchema) : null;
  }

  /**
   * gbraver_burst_connectionに項目追加する
   *
   * @param connection 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(connection: ConnectionsSchema): Promise<void> {
    await this._client.put({
      TableName: this._tableName,
      Item: connection,
    });
  }

  /**
   * gbraver_burst_connectionの項目を削除する
   *
   * @param connectionId コネクションID
   * @return 項目削除が完了したら発火するPromise
   */
  async delete(connectionId: string): Promise<void> {
    await this._client.delete({
      TableName: this._tableName,
      Key: {
        connectionId,
      },
    });
  }
}
