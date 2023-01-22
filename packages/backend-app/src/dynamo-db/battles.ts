import { DynamoDB } from "aws-sdk";

import type { Battle, BattlePlayer } from "../core/battle";

/**
 * battlesのスキーマ
 * パーティションキー battleID
 */
export type BattlesSchema = Battle<BattlePlayer>;

/** battlesのDAO*/
export class Battles {
  _client: DynamoDB.DocumentClient;
  _tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDB.DocumentClient, tableName: string) {
    this._client = client;
    this._tableName = tableName;
  }

  /**
   * 項目追加する
   *
   * @param battle 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(battle: BattlesSchema): Promise<void> {
    await this._client
      .put({
        TableName: this._tableName,
        Item: battle,
      })
      .promise();
  }

  /**
   * バトルID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param battleID バトルID
   * @return 検索結果
   */
  async get(battleID: string): Promise<BattlesSchema | null> {
    const result = await this._client
      .get({
        TableName: this._tableName,
        Key: {
          battleID,
        },
      })
      .promise();
    return result.Item ? (result.Item as BattlesSchema) : null;
  }

  /**
   * ユニークキー指定で項目を削除する
   *
   * @param battleID バトルID
   * @return 削除受付したら発火するPromise
   */
  async delete(battleID: string): Promise<void> {
    await this._client
      .delete({
        TableName: this._tableName,
        Key: {
          battleID,
        },
      })
      .promise();
  }
}
