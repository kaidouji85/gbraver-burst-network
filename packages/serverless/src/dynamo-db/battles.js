// @flow

import {DynamoDB} from "aws-sdk";
import type {Battle, BattlePlayer} from "../dto/battle";

/** battlesに格納するプレイヤーの情報 */
export type PlayerSchema = BattlePlayer & {
  /** コネクションID */
  connectionId: string,
};

/** battlesのスキーマ */
export type BattlesSchema = Battle<PlayerSchema>;

/** battlesのDAO*/
export class Battles {
  _client: typeof DynamoDB.DocumentClient;
  _tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: typeof DynamoDB.DocumentClient, tableName: string) {
    this._client = client;
    this._tableName = tableName;
  }

  /**
   * 項目追加する
   *
   * @param battle 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(battle: BattlesSchema): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: battle})
      .promise();
  }

  /**
   * バトルID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param battleID バトルID
   * @return 検索結果
   */
  async get(battleID: string): Promise<?BattlesSchema> {
    const result = await this._client.get({
      TableName: this._tableName,
      Key: {battleID},
    }).promise();
    return result?.Item ?? null;
  }
}