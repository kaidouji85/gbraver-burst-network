import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

import {
  CasualMatchEntry,
  CasualMatchEntrySchema,
} from "../core/casual-match-entry";

/**
 * DynamoDB スキーマ casual_match_entries
 * パーティションキー userID
 */
type DynamoCasualMatchEntry = CasualMatchEntry;

/** DynamoCasualMatchEntry zodスキーマ */
const DynamoCasualMatchEntrySchema = CasualMatchEntrySchema;

/** DynamoDB DAO casual_match_entries */
export class DynamoCasualMatchEntries {
  #dynamoDB: DynamoDBDocument;
  #tableName: string;

  /**
   * コンストラクタ
   *
   * @param dynamoDB DynamoDBDocument
   * @param tableName テーブル名
   */
  constructor(dynamoDB: DynamoDBDocument, tableName: string) {
    this.#dynamoDB = dynamoDB;
    this.#tableName = tableName;
  }

  /**
   * 項目追加する
   *
   * @param entry 追加する項目
   * @returns 処理が完了したら発火するPromise
   */
  async put(entry: DynamoCasualMatchEntry): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: entry,
    });
  }

  /**
   * 全項目を取得する
   *
   * @param limit 検索件数の上限
   * @returns 取得結果
   */
  async scan(limit: number): Promise<DynamoCasualMatchEntry[]> {
    const resp = await this.#dynamoDB.scan({
      TableName: this.#tableName,
      Select: "ALL_ATTRIBUTES",
      ConsistentRead: true,
      Limit: limit,
    });
    return resp.Items
      ? z.array(DynamoCasualMatchEntrySchema).parse(resp.Items)
      : [];
  }

  /**
   * パーティションキー指定で項目を削除する
   *
   * @param userID ユーザID
   * @returns 削除受付したら発火するPromise
   */
  async delete(userID: string): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        userID,
      },
    });
  }
}
