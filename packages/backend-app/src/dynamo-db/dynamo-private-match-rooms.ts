import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import {
  PrivateMatchRoom,
  PrivateMatchRoomID,
  PrivateMatchRoomSchema,
} from "../core/private-match-room";
import { UserID } from "../core/user";
import { isConditionalCheckFailedException } from "./is-conditional-check-failed-exception";

/**
 * DynamoDB スキーマ private-match-rooms
 * パーティションキー roomID
 */
type DynamoPrivateMatchRoom = PrivateMatchRoom;

/** DynamoPrivateMatchRoom zodスキーマ */
const DynamoPrivateMatchRoomSchema = PrivateMatchRoomSchema;

/** DynamoDB DAO private-match-rooms */
export class DynamoPrivateMatchRooms {
  /** DynamoDBDocument */
  #dynamoDB: DynamoDBDocument;
  /** テーブル物理名 */
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
   * ルームIDを指定してルームを取得する
   * データが存在しない場合はnullを返す
   * @param roomID ルームID
   * @returns 取得結果、存在しない場合はnull
   */
  async get(
    roomID: PrivateMatchRoomID,
  ): Promise<DynamoPrivateMatchRoom | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: { roomID },
      ConsistentRead: true,
    });
    return result.Item ? DynamoPrivateMatchRoomSchema.parse(result.Item) : null;
  }

  /**
   * 項目を追加する
   * 同じroomIDが存在する場合は何もしない
   * @param room 追加する項目
   * @returns 追加に成功したらtrue、同じroomIDが存在する場合はfalse
   */
  async put(room: DynamoPrivateMatchRoom): Promise<boolean> {
    try {
      const Item = DynamoPrivateMatchRoomSchema.parse(room);
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
  async delete(roomID: PrivateMatchRoomID): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: { roomID },
    });
  }

  /**
   * @deprecated
   * パーティションキー指定で項目を削除する
   * @param owner プライベートマッチルーム作成者
   * @returns 削除受付したら発火するPromise
   */
  async deprecatedDelete(owner: UserID): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        owner,
      },
    });
  }
}
