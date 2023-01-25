import { DynamoDB } from "aws-sdk";

import { PrivateMatchEntry } from "../core/private-match-entry";
import { PrivateMatchRoomID } from "../core/private-match-room";
import { UserID } from "../core/user";

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
   * エントリを検索する
   * @param roomID ルームID
   * @param userID ユーザID
   * @return 検索結果、見つからない場合はnullを返す
   */
  async get(
    roomID: PrivateMatchRoomID,
    userID: UserID
  ): Promise<PrivateMatchEntriesSchema | null> {
    const result = await this.#client
      .get({
        TableName: this.#tableName,
        Key: {
          roomID,
          userID,
        },
      })
      .promise();
    return result.Item ? (result.Item as PrivateMatchEntriesSchema) : null;
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
