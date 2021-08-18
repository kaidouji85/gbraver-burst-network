// @flow

import {DynamoDB} from "aws-sdk";

/** casual_match_entriesのスキーマ */
type CasualMatchEntry = {
  userID: string,
  armdozerId: string,
  pilotId: string
}

/** casual_match_entriesのDAO */
export class CasualMatchEntries {
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
   * 項目追加する
   *
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(entry: CasualMatchEntry): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: entry})
      .promise();
  }
}