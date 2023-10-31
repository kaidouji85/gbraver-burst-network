import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import {
  PrivateMatchRoom,
  PrivateMatchRoomSchema,
} from "../core/private-match-room";
import { UserID } from "../core/user";

/**
 * DynamoDB スキーマ private-match-rooms
 * パーティションキー owner
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
   * パーティションキー指定で検索
   * データが存在しない場合はnullを返す
   * @param owner ルーム作成者のユーザID
   * @return 検索結果
   */
  async get(owner: UserID): Promise<DynamoPrivateMatchRoom | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: {
        owner,
      },
      ConsistentRead: true,
    });
    return result.Item ? DynamoPrivateMatchRoomSchema.parse(result.Item) : null;
  }

  /**
   * 項目追加する
   * @param room 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(room: DynamoPrivateMatchRoom): Promise<void> {
    await this.#dynamoDB.put({
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
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        owner,
      },
    });
  }
}
