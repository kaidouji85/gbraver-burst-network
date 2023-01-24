import { DynamoDB } from "aws-sdk";

import { PrivateMatchEntry } from "../core/private-match-entry";

/**
 * private-match-entries スキーマ
 * パーティションキー roomID
 * ソートキー userID
 */
export type PrivateMatchEntriesSchema = PrivateMatchEntry;

/** private-match-entries DAO */
export class PrivateMatchEntries {
  /** DynamoDBクライアント */
  #client: DynamoDB.DocumentClient;
  /** テーブル名 */
  #tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDB.DocumentClient, tableName: string) {
    this.#client = client;
    this.#tableName = tableName;
  }

  /**
   * 項目追加する
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(entry: PrivateMatchEntriesSchema): Promise<void> {
    await this.#client
      .put({
        TableName: this.#tableName,
        Item: entry,
      })
      .promise();
  }
}
