import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import {
  createSignalingChannel,
  SignalingChannel,
  SignalingChannelSchema,
} from "../core/signaling-channel";

/**
 * DynamoDBスキーマ signaling-channel
 * パーティションキー: signalingID
 */
export type DynamoSignalingChannel = SignalingChannel;

/** DynamoSignalingChannel zodスキーマ */
export const DynamoSignalingChannelSchema = SignalingChannelSchema;

/** DynamoDB signaling-channels の DAO */
export class DynamoSignalingChannels {
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
   * シグナリングチャネルを新規作成する
   * @param channel 保存内容
   * @returns 処理が完了したら発火するPromise
   */
  async put(options: {
    hostConnectionId: string;
    guestConnectionId: string;
  }): Promise<void> {
    const channel = createSignalingChannel(options);
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: channel,
    });
  }
}
