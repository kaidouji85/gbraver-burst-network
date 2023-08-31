import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

import { PrivateMatchEntry, PrivateMatchEntrySchema } from "../core/private-match-entry";
import { PrivateMatchRoomID } from "../core/private-match-room";
import { UserID } from "../core/user";

/**
 * DynamoDB スキーマ private-match-entries
 * パーティションキー roomID
 * ソートキー userID
 */
type DynamoPrivateMatchEntry = PrivateMatchEntry;

/** DynamoPrivateMatchEntry zodスキーマ */
const DynamoPrivateMatchEntrySchema = PrivateMatchEntrySchema;

/** DynamoDB DAO private-match-entries */
export class DynamoPrivateMatchEntries {
  /** DynamoDBDocument */
  #dynamoDB: DynamoDBDocument;
  /** テーブル名 */
  #tableName: string;

  /**
   * コンストラクタ
   * @param dynamoDB DynamoDBDocument
   * @param tableName テーブル名
   */
  constructor(dynamoDB: DynamoDBDocument, tableName: string) {
    this.#dynamoDB = dynamoDB;
    this.#tableName = tableName;
  }

  /**
   * ルーム配下のエントリを取得する
   * @param roomID ルームID
   * @return 取得結果
   */
  async getEntries(
    roomID: PrivateMatchRoomID,
  ): Promise<DynamoPrivateMatchEntry[]> {
    const result = await this.#dynamoDB.query({
      TableName: this.#tableName,
      KeyConditionExpression: "#hash = :roomID",
      ExpressionAttributeNames: {
        "#hash": "roomID",
      },
      ExpressionAttributeValues: {
        ":roomID": roomID,
      },
    });
    return result.Items ? (z.array(DynamoPrivateMatchEntrySchema).parse(result.Items)) : [];
  }

  /**
   * 項目追加する
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(entry: DynamoPrivateMatchEntry): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: entry,
    });
  }

  /**
   * エントリを削除する
   * @param roomID ルームID
   * @param userID ユーザID
   * @return 処理が完了したら発火するPromise
   */
  async delete(roomID: PrivateMatchRoomID, userID: UserID): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        roomID,
        userID,
      },
    });
  }
}
