// @flow

import {DynamoDB} from "aws-sdk";
import type {User} from '../dto/user';

/** gbraver_burst_connectionのスキーマ */
type GbraverBurstConnection = {
  connectionId: string,
  user: User,
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
   * gbraver_burst_connectionに項目追加する
   *
   * @param connection 追加する項目
   * @return 項目追加が完了したら発火するPromise
   */
  async put(connection: GbraverBurstConnection): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: connection})
      .promise();
  }

  /**
   * gbraver_burst_connectionの項目を削除する
   *
   * @param connectionId コネクションID
   * @return 項目削除が完了したら発火するPromise
   */
  async delete(connectionId: string): Promise<void> {
    const Key = {connectionId};
    return this._client
      .delete({TableName: this._tableName, Key})
      .promise();
  }
}