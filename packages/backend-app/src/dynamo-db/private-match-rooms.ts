import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import {
  PrivateMatchRoom,
  PrivateMatchRoomID,
} from "../core/private-match-room";
import { UserID } from "../core/user";

/**
 * private-match-rooms スキーマ
 * パーティションキー owner
 */
export type PrivateMatchRoomsSchema = PrivateMatchRoom;

/** private-match-roomsのDAO */
export class PrivateMatchRooms {
  /** DynamoDB Client */
  #client: DynamoDBDocument;
  /** テーブル物理名 */
  #tableName: string;

  /**
   * コンストラクタ
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDBDocument, tableName: string) {
    this.#client = client;
    this.#tableName = tableName;
  }

  /**
   * パーティションキー指定で検索
   * データが存在しない場合はnullを返す
   * @param owner ルーム作成者のユーザID
   * @return 検索結果
   */
  async get(owner: UserID): Promise<PrivateMatchRoomsSchema | null> {
    const result = await this.#client.get({
      TableName: this.#tableName,
      Key: {
        owner,
      },
    });
    return result.Item ? (result.Item as PrivateMatchRoomsSchema) : null;
  }

  /**
   * 項目追加する
   * @param room 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(room: PrivateMatchRoomsSchema): Promise<void> {
    await this.#client.put({
      TableName: this.#tableName,
      Item: room,
    });
  }

  /**
   * パーティションキー指定で項目を削除する
   * @param owner プライベートマッチルーム作成者
   * @return 削除受付したら発火するPromise
   */
  async delete(owner: UserID): Promise<void> {
    await this.#client.delete({
      TableName: this.#tableName,
      Key: {
        owner,
      },
    });
  }

  /**
   * 指定したプライベートマッチルームが存在するか否かを判定する
   * @param roomID プライベートルームID
   * @return 判定結果、trueで存在する
   */
  async isExistRoom(roomID: PrivateMatchRoomID): Promise<boolean> {
    const result = await this.#client.query({
      TableName: this.#tableName,
      IndexName: "roomID",
      KeyConditionExpression: "roomID = :roomID",
      ExpressionAttributeValues: {
        ":roomID": roomID,
      },
    });
    return result?.Items ? 0 < result.Items.length : false;
  }
}
