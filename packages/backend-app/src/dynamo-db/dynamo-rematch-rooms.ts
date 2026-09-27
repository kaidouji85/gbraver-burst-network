import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import {
  RematchRoom,
  RematchRoomID,
  RematchRoomSchema,
} from "../core/matching/rematch/rematch-room";
import { isConditionalCheckFailedException } from "./is-conditional-check-failed-exception";

/**
 * DynamoDB スキーマ rematch-rooms
 * パーティションキー roomID
 * TTL 属性 expiresAt
 */
export type DynamoRematchRoom = RematchRoom;

/** DynamoRematchRoom zod スキーマ */
export const DynamoRematchRoomsSchema = RematchRoomSchema;

/** DynamoDB DAO rematch-rooms */
export class DynamoRematchRooms {
  /** DynamoDBDocument */
  #dynamoDB: DynamoDBDocument;
  /** テーブル物理名 */
  #tableName: string;

  /**
   * コンストラクタ
   * @param dynamoDB DynamoDBDocument
   * @param tableName テーブル物理名
   */
  constructor(dynamoDB: DynamoDBDocument, tableName: string) {
    this.#dynamoDB = dynamoDB;
    this.#tableName = tableName;
  }

  /**
   * ルームIDを指定してルームを取得する
   * データが存在しない場合はnullを返す
   * @param roomID ルームID
   * @returns 取得結果、存在しない場合はnull
   */
  async get(roomID: RematchRoomID): Promise<DynamoRematchRoom | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: { roomID },
      ConsistentRead: true,
    });
    return result.Item ? DynamoRematchRoomsSchema.parse(result.Item) : null;
  }

  /**
   * 項目を追加する
   * 同じroomIDが存在する場合は何もしない
   * @param room 追加する項目
   * @returns 追加に成功したらtrue、同じroomIDが存在する場合はfalse
   */
  async put(room: DynamoRematchRoom): Promise<boolean> {
    try {
      const Item = DynamoRematchRoomsSchema.parse(room);
      await this.#dynamoDB.put({
        TableName: this.#tableName,
        Item,
        ConditionExpression: "attribute_not_exists(roomID)",
      });
      return true;
    } catch (error) {
      if (isConditionalCheckFailedException(error)) {
        return false;
      }
      throw error;
    }
  }

  /**
   * ルームIDを指定してルームを削除する
   * @param roomID ルームID
   * @returns 削除受付したら発火するPromise
   */
  async delete(roomID: RematchRoomID): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: { roomID },
    });
  }
}
