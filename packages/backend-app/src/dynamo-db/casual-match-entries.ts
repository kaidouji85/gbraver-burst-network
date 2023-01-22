import { DynamoDB } from "aws-sdk";

import type { CasualMatchEntry } from "../core/casual-match";

/**
 * casual_match_entriesのスキーマ
 * パーティションキー UserID
 */
export type CasualMatchEntriesSchema = CasualMatchEntry;

/** casual_match_entriesのDAO */
export class CasualMatchEntries {
  _client: DynamoDB.DocumentClient;
  _tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDB.DocumentClient, tableName: string) {
    this._client = client;
    this._tableName = tableName;
  }

  /**
   * 項目追加する
   *
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(entry: CasualMatchEntriesSchema): Promise<void> {
    await this._client
      .put({
        TableName: this._tableName,
        Item: entry,
      })
      .promise();
  }

  /**
   * 全項目を取得する
   *
   * @param limit 検索件数の上限
   * @return 取得結果
   */
  async scan(limit: number): Promise<CasualMatchEntriesSchema[]> {
    const resp = await this._client
      .scan({
        TableName: this._tableName,
        Select: "ALL_ATTRIBUTES",
        ConsistentRead: true,
        Limit: limit,
      })
      .promise();
    return resp.Items ? (resp.Items as CasualMatchEntriesSchema[]) : [];
  }

  /**
   * ユニークキー指定で項目を削除する
   *
   * @param userID ユーザID
   * @return 削除受付したら発火するPromise
   */
  async delete(userID: string): Promise<void> {
    await this._client
      .delete({
        TableName: this._tableName,
        Key: {
          userID,
        },
      })
      .promise();
  }
}
