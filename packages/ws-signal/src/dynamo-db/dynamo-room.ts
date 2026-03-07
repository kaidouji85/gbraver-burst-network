import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../core/web-rtc";

/** DynamoDBスキーマ room */
export type DynamoRooms = {
  /** ルームID（パーティションキー） */
  roomID: string;
  /** ルームに入室可能であるか否か、trueで入室可能 */
  canEntry: boolean;
  /** ルームのホストのシグナル情報 */
  hostSignal: {
    /** WebRTCのセッション記述 */
    sdp: RTCSessionDescriptionInit;
    /** WebRTCのICE候補 */
    iceCandidates: RTCIceCandidateInit[];
  };
};

/** DynamoRooms zodスキーマ */
export const DynamoRoomsSchema = z.object({
  roomID: z.string(),
  canEntry: z.boolean(),
  hostSignal: z.object({
    sdp: RTCSessionDescriptionInitSchema,
    iceCandidates: z.array(RTCIceCandidateInitSchema),
  }),
});

/** DynamoDB rooms の DAO */
export class DynamoRoomsDAO {
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
   * ルームIDが既に存在する場合は、条件式によりエラーになる
   * @param room 保存するルーム情報
   */
  async put(room: DynamoRooms): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: room,
      ConditionExpression: "attribute_not_exists(roomID)",
    });
  }
}
