// @flow

import { DynamoDB } from "aws-sdk";

import type { Battle, BattlePlayer } from "../core/battle";

/** battlesのスキーマ */
export type BattlesSchema = Battle<BattlePlayer>;

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
      .put({ TableName: this._tableName, Item: battle })
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
    const result = await this._client
      .get({
        TableName: this._tableName,
        Key: { battleID },
      })
      .promise();
    return result?.Item ?? null;
  }

  /**
   * ユニークキー指定で項目を削除する
   *
   * @param battleID バトルID
   * @return 削除受付したら発火するPromise
   */
  delete(battleID: string): Promise<void> {
    return this._client
      .delete({
        TableName: this._tableName,
        Key: { battleID },
      })
      .promise();
  }
}
