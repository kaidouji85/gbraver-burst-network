import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import {
  createSignalingChannel,
  SignalingChannel,
  SignalingChannelSchema,
} from "../core/signaling-channel";
import { isConditionalCheckFailedException } from "./is-conditional-check-failed-exception";

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
   * @returns 生成したシグナリングチャネル
   */
  async put(options: {
    hostConnectionId: string;
    guestConnectionId: string;
  }): Promise<DynamoSignalingChannel> {
    const channel = createSignalingChannel(options);
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: channel,
    });
    return channel;
  }

  /**
   * シグナリングチャネルを取得する
   * @param signalingID シグナリングID
   * @returns 取得結果、存在しない場合はnull
   */
  async get(signalingID: string): Promise<DynamoSignalingChannel | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: { signalingID },
      ConsistentRead: true,
    });
    return result.Item ? DynamoSignalingChannelSchema.parse(result.Item) : null;
  }

  /**
   * 指定したシグナリングチャネルを削除する
   * ホストのみが削除できるように、引数のコネクションIDがホストのコネクションIDが一致した場合に削除する
   * @param options オプション
   * @param options.signalingID シグナリングID
   * @param options.connectionId 実行者のコネクションID
   * @returns 削除対象が存在した場合は削除されたアイテム、存在しない場合はnull
   */
  async delete(options: {
    signalingID: string;
    connectionId: string;
  }): Promise<DynamoSignalingChannel | null> {
    const { signalingID, connectionId } = options;
    try {
      const result = await this.#dynamoDB.delete({
        TableName: this.#tableName,
        Key: { signalingID },
        ConditionExpression: "hostConnectionId = :connectionId",
        ExpressionAttributeValues: {
          ":connectionId": connectionId,
        },
        ReturnValues: "ALL_OLD",
      });
      const parsed = DynamoSignalingChannelSchema.safeParse(result.Attributes);
      return parsed.success ? parsed.data : null;
    } catch (error) {
      if (!isConditionalCheckFailedException(error)) {
        throw error;
      }
      return null;
    }
  }

  /**
   * 指定したシグナリングチャネルを強制削除する
   * @param signalingID シグナリングID
   * @returns 削除対象が存在した場合は削除されたアイテム、存在しない場合はnull
   */
  async forceDelete(
    signalingID: string,
  ): Promise<DynamoSignalingChannel | null> {
    const result = await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: { signalingID },
      ReturnValues: "ALL_OLD",
    });
    const parsed = DynamoSignalingChannelSchema.safeParse(result.Attributes);
    return parsed.success ? parsed.data : null;
  }
}
