import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

import {
  RematchEntry,
  RematchEntrySchema,
} from "../core/matching/rematch/rematch-entry";
import { RematchRoomID } from "../core/matching/rematch/rematch-room";
import { UserID } from "../core/user";

/**
 * DynamoDB スキーマ rematch-entries
 * パーティションキー roomID
 * ソートキー userID
 */
export type DynamoRematchEntry = RematchEntry;

/** DynamoRematchEntry zod スキーマ */
export const DynamoRematchEntrySchema = RematchEntrySchema;

/** DynamoDB DAO rematch-entries */
export class DynamoRematchEntries {
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
   * @returns 取得結果
   */
  async getEntries(roomID: RematchRoomID): Promise<DynamoRematchEntry[]> {
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
    return result.Items
      ? z.array(DynamoRematchEntrySchema).parse(result.Items)
      : [];
  }

  /**
   * 項目追加する
   * @param entry 追加する項目
   * @returns 処理が完了したら発火するPromise
   */
  async put(entry: DynamoRematchEntry): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: entry,
    });
  }

  /**
   * エントリを削除する
   * @param roomID ルームID
   * @param userID ユーザID
   * @returns 処理が完了したら発火するPromise
   */
  async delete(roomID: RematchRoomID, userID: UserID): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        roomID,
        userID,
      },
    });
  }
}
