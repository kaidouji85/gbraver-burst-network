import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import type { CasualMatchEntry } from "../core/casual-match-entry";

/**
 * casual_match_entriesのスキーマ
 * パーティションキー userID
 */
export type CasualMatchEntriesSchema = CasualMatchEntry;

/** casual_match_entriesのDAO */
export class CasualMatchEntries {
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
   * 項目追加する
   *
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(entry: CasualMatchEntriesSchema): Promise<void> {
    await this._client.put({
      TableName: this._tableName,
      Item: entry,
    });
  }

  /**
   * 全項目を取得する
   *
   * @param limit 検索件数の上限
   * @return 取得結果
   */
  async scan(limit: number): Promise<CasualMatchEntriesSchema[]> {
    const resp = await this._client.scan({
      TableName: this._tableName,
      Select: "ALL_ATTRIBUTES",
      ConsistentRead: true,
      Limit: limit,
    });
    return resp.Items ? (resp.Items as CasualMatchEntriesSchema[]) : [];
  }

  /**
   * パーティションキー指定で項目を削除する
   *
   * @param userID ユーザID
   * @return 削除受付したら発火するPromise
   */
  async delete(userID: string): Promise<void> {
    await this._client.delete({
      TableName: this._tableName,
      Key: {
        userID,
      },
    });
  }
}
