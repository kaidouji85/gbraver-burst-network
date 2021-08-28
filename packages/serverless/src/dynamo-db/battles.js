// @flow

import type {GameState, Player} from "gbraver-burst-core";
import type {UserID} from "../dto/user";
import {DynamoDB} from "aws-sdk";

/** プレイヤー情報 */
export type BattlePlayer = Player & {
  userID: UserID,
};

/** battlesのスキーマ */
export type Battle = {
  /** バトルID */
  battleID: string,
  /** バトルに参加しているプレイヤー */
  players: BattlePlayer,
  /** ステートヒストリー */
  stateHistory: GameState[],
  /**
   * ステップID
   * ゲームが進行するたびに、ユニークなIDが割り振られる
   */
  flowID: string,
};

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
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(entry: Battle): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: entry})
      .promise();
  }
}