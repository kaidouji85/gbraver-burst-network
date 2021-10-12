// @flow

import {DynamoDB} from "aws-sdk";
import type {UserID} from '../core/user';
import type {BattleID} from "../core/battle";
import type {PlayerId} from "gbraver-burst-core";

/** コネクションの状態 */
export type ConnectionState = None | CasualMatchMaking | InBattle;

/** 状態なし */
export type None = {
  type: 'None'
};

/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: 'CasualMatchMaking'
};

/** バトルに参加しているプレイヤー */
export type InBattlePlayer = {
  /** ユーザID */
  userID: UserID,
  /** プレイヤーID */
  playerId: PlayerId,
  /** コネクションID */
  connectionId: string,
};

/** 戦闘中 */
export type InBattle = {
  type: 'InBattle',
  /** 現在実行している戦闘のID */
  battleID: BattleID,
  /** バトルに参加しているプレイヤーの情報 */
  players: [InBattlePlayer, InBattlePlayer],
};

/** gbraver_burst_connectionのスキーマ */
export type GbraverBurstConnectionsSchema = {
  /** コネクションID */
  connectionId: string,
  /** ユーザID */
  userID: UserID,
  /** ステート */
  state: ConnectionState,
};

/** gbraver_burst_connectionのDAO */
export class GbraverBurstConnections {
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
   * コネクションID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param connectionId コネクションID
   * @return 検索結果
   */
  async get(connectionId: string): Promise<?GbraverBurstConnectionsSchema> {
    const result = await this._client.get({
      TableName: this._tableName,
      Key: {connectionId},
    }).promise();
    return result?.Item ?? null;
  }

  /**
   * gbraver_burst_connectionに項目追加する
   *
   * @param connection 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(connection: GbraverBurstConnectionsSchema): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: connection})
      .promise();
  }

  /**
   * gbraver_burst_connectionの項目を削除する
   *
   * @param connectionId コネクションID
   * @return 項目削除が完了したら発火するPromise
   */
  async delete(connectionId: string): Promise<void> {
    return this._client.delete({
      TableName: this._tableName,
      Key: {connectionId}
    }).promise();
  }
}