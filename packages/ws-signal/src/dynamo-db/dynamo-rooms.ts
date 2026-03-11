import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../core/web-rtc";
import { isConditionalCheckFailedException } from "./is-conditional-check-failed-exception";

/** DynamoDBスキーマ room */
export type DynamoRoom = {
  /** ルームID（パーティションキー） */
  roomID: string;
  /** ホストのコネクションID */
  hostConnectionId: string;
  /** ルームのホストのシグナル情報 */
  hostSignal: {
    /** WebRTCのセッション記述 */
    sdp: RTCSessionDescriptionInit;
    /** WebRTCのICE候補 */
    iceCandidates: RTCIceCandidateInit[];
  };
};

/** DynamoRoom zodスキーマ */
export const DynamoRoomSchema = z.object({
  roomID: z.string(),
  hostConnectionId: z.string(),
  hostSignal: z.object({
    sdp: RTCSessionDescriptionInitSchema,
    iceCandidates: z.array(RTCIceCandidateInitSchema),
  }),
});

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
