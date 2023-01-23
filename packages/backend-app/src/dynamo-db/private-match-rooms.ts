import { DynamoDB } from "aws-sdk";
import { UserID } from "aws-sdk/clients/personalizeruntime";

import { PrivateMatchRoom } from "../core/private-match-room";

/**
 * private-match-rooms スキーマ
 * パーティションキー owner
 */
export type PrivateMatchRoomsSchema = PrivateMatchRoom;

/** private-match-roomsのDAO */
export class PrivateMatchRooms {
  /** DynamoDB Client */
  #client: DynamoDB.DocumentClient;
  /** テーブル物理名 */
  #tableName: string;

  /**
   * コンストラクタ
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDB.DocumentClient, tableName: string) {
    this.#client = client;
    this.#tableName = tableName;
  }

  /**
   * 項目追加する
   * @param room 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(room: PrivateMatchRoomsSchema): Promise<void> {
    await this.#client
      .put({
        TableName: this.#tableName,
        Item: room,
      })
      .promise();
  }

  /**
   * パーティションキー指定で項目を削除する
   * @param owner プライベートマッチルーム作成者
   * @return 削除受付したら発火するPromise
   */
  async delete(owner: UserID): Promise<void> {
    await this.#client
      .delete({
        TableName: this.#tableName,
        Key: {
          owner,
        },
      })
      .promise();
  }
}
