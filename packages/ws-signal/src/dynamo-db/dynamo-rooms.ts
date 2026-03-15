import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { WSSignalRoom, WSSignalRoomSchema } from "../core/ws-room";
import { isConditionalCheckFailedException } from "./is-conditional-check-failed-exception";

/** 
 * DynamoDBスキーマ room
 * パーティションキー: roomID
 */
export type DynamoRoom = WSSignalRoom;

/** DynamoRoom zodスキーマ */
export const DynamoRoomSchema = WSSignalRoomSchema;

/** DynamoDB rooms の DAO */
export class DynamoRooms {
  /** DynamoDBDocument */
  #dynamoDB: DynamoDBDocument;
  /** DynamoDB テーブル名 */
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
   * ルーム情報をDynamoDBに保存する
   * 条件付きPutを行うため、同じルームIDが存在する場合は何もしない
   * @param room 保存するルーム情報
   * @return ルーム情報の保存に成功した場合はtrue、同じルームIDが存在する場合はfalse
   */
  async put(room: DynamoRoom): Promise<boolean> {
    try {
      await this.#dynamoDB.put({
        TableName: this.#tableName,
        Item: room,
        ConditionExpression: "attribute_not_exists(roomID)",
      });
      return true;
    } catch (error) {
      if (!isConditionalCheckFailedException(error)) {
        throw error;
      }
      return false;
    }
  }

  async update(roomID: string): Promise<void> {
    await this.#dynamoDB.update({
      TableName: this.#tableName,
      Key: { roomID },
      UpdateExpression: "SET #state = :state",
      ExpressionAttributeNames: {
        "#state": "state",
      },
      ExpressionAttributeValues: {
        ":state": "awaiting-guest-signal",
        ":expectedState": "awaiting-guest-join",
      },
      ConditionExpression: "attribute_exists(roomID) AND #state = :expectedState",
    });
  }

  /**
   * ルーム情報を削除して、削除前のルーム情報を返す
   * 条件付きで削除するため、ルームIDが存在しない場合は何もせずにnullを返す
   * @param roomID ルームID
   * @return 削除に成功した場合はルーム情報、失敗時はnull
   */
  async deleteAndReturnOld(roomID: string): Promise<DynamoRoom | null> {
    try {
      const result = await this.#dynamoDB.delete({
        TableName: this.#tableName,
        Key: { roomID },
        ConditionExpression: "attribute_exists(roomID)",
        ReturnValues: "ALL_OLD",
      });
      return DynamoRoomSchema.parse(result.Attributes);
    } catch (error) {
      if (!isConditionalCheckFailedException(error)) {
        throw error;
      }
      return null;
    }
  }
}
