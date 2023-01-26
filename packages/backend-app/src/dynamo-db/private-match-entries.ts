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
   * ルーム配下のエントリを取得する
   * @param roomID ルームID
   * @return 取得結果
   */
  async getEntries(
    roomID: PrivateMatchRoomID
  ): Promise<PrivateMatchEntriesSchema[]> {
    const result = await this.#client
      .query({
        TableName: this.#tableName,
        KeyConditionExpression: "#hash = :roomID",
        ExpressionAttributeNames: {
          "#hash": "roomID",
        },
        ExpressionAttributeValues: {
          ":roomID": roomID,
        },
      })
      .promise();
    return result.Items ? (result.Items as PrivateMatchEntriesSchema[]) : [];
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

  /**
   * エントリを削除する
   * @param roomID ルームID
   * @param userID ユーザID
   * @return 処理が完了したら発火するPromise
   */
  async delete(roomID: PrivateMatchRoomID, userID: UserID): Promise<void> {
    await this.#client
      .delete({
        TableName: this.#tableName,
        Key: {
          roomID,
          userID,
        },
      })
      .promise();
  }
}
