// @flow

import {DynamoDB} from "aws-sdk";

/** gbraver_burst_connectionのスキーマ */
type GbraverBurstConnection = {
  connectionId: string,
};

/** gbraver_burst_connectionのDAO */
export class GbraverBurstConnections {
  _client: typeof DynamoDB.DocumentClient;
  _tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: typeof DynamoDB.DocumentClient, tableName: string) {
    this._client = client;
    this._tableName = tableName;
  }

  /**
   * sls_chat_connectionsに項目追加する
   *
   * @param connection 追加する項目
   * @return 項目追加が完了したら発火するPromise
   */
  async put(connection: GbraverBurstConnection): Promise<void> {
    return this._client.put({TableName: this._tableName, Item: connection}).promise();
  }

  /**
   * sls_chat_connectionsの項目を削除する
   *
   * @param connectionId コネクションID
   * @return 項目削除が完了したら発火するPromise
   */
  async delete(connectionId: string): Promise<void> {
    const Key = {connectionId};
    return this._client.delete({TableName: this._tableName, Key}).promise();
  }

  /**
   * sls_chat_connectionsの全項目を取得する
   *
   * @return 取得結果
   */
  async all(): Promise<GbraverBurstConnection[]> {
    const resp = await this._client.scan({TableName: this._tableName, ProjectionExpression: 'connectionId'}).promise();
    return resp.Items;
  }
}