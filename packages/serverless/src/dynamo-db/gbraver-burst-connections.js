// @flow

import {DynamoDB} from "aws-sdk";
import type {UserID} from '../dto/user';

/** ユーザの状態 */
export type UserState = None | CasualMatchMaking;

/** 状態なし */
export type None = {
  type: 'None'
};

/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: 'CasualMatchMaking'
};

/** gbraver_burst_connectionのスキーマ */
export type GbraverBurstConnection = {
  connectionId: string,
  userID: UserID,
  state: UserState,
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
   * コネクションID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param connectionId
   * @return 検索結果
   */
  async get(connectionId: string): Promise<?GbraverBurstConnection> {
    const result = await this._client.get({
      TableName: this._tableName,
      Key: {connectionId},
    }).promise();
    return result?.Item ?? null;
  }

  /**
   * gbraver_burst_connectionに項目追加する
   *
   * @param connection 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(connection: GbraverBurstConnection): Promise<void> {
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
    return this._client.delete({
      TableName: this._tableName,
      Key: {connectionId}
    }).promise();
  }
}