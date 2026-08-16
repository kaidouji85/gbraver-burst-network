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
   * ルームを新規作成する
   * 条件付きPutを行うため、同じルームIDが存在する場合は何もしない
   * @param options ルーム情報の保存に必要な情報
   * @param options.roomID ルームID
   * @param options.hostConnectionId ホストのコネクションID
   * @return ルーム情報の保存に成功した場合はtrue、同じルームIDが存在する場合はfalse
   */
  async put(options: {
    roomID: string;
    hostConnectionId: string;
  }): Promise<boolean> {
    try {
      const { roomID, hostConnectionId } = options;
      const room: DynamoRoom = {
        roomID,
        hostConnectionId,
        state: "awaiting-guest-join",
      };
      await this.#dynamoDB.put({
        TableName: this.#tableName,
        Item: DynamoRoomSchema.parse(room),
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

  /**
   * ルームの状態を "awaiting-guest-join" から "awaiting-signaling-channel-created" に更新する
   * 以下の条件で、条件付きUpdateを行う
   *   - roomIDが存在する
   *   - ルームの状態が"awaiting-guest-join"である
   * @param roomID ルームID
   * @return 更新に成功した場合は更新後のルーム情報、更新できなかった場合はnull
   */
  async updateToAwaitingSignalingChannelCreated(
    roomID: string,
  ): Promise<DynamoRoom | null> {
    try {
      const result = await this.#dynamoDB.update({
        TableName: this.#tableName,
        Key: { roomID },
        UpdateExpression: "SET #state = :state",
        ExpressionAttributeNames: {
          "#state": "state",
        },
        ExpressionAttributeValues: {
          ":state": "awaiting-signaling-channel-created",
          ":expectedState": "awaiting-guest-join",
        },
        ConditionExpression:
          "attribute_exists(roomID) AND #state = :expectedState",
        ReturnValues: "ALL_NEW",
      });
      return DynamoRoomSchema.parse(result.Attributes);
    } catch (error) {
      if (!isConditionalCheckFailedException(error)) {
        throw error;
      }
      return null;
    }
  }

  /**
   * ルームを削除する
   * @param roomID 削除するルームID
   */
  async delete(roomID: string): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: { roomID },
    });
  }
}
