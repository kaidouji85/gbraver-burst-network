// @flow

import type {Command} from 'gbraver-burst-core';
import {DynamoDB} from "aws-sdk";
import type {BattleID, FlowID} from "../core/battle";
import type {UserID} from "../core/user";

/** battle-commands のスキーマ */
export type BattleCommandsSchema = {
  /** ユーザID */
  userID: UserID,
  /** バトルID */
  battleID: BattleID,
  /** フローID */
  flowID: FlowID,
  /** コマンド */
  command: Command,
};

/** battle-commandsのDAO */
export class BattleCommands {
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
   * @param command 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(command: BattleCommandsSchema): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: command})
      .promise();
  }

  /**
   * ユーザID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param userID ユーザID
   * @return 検索結果
   */
  async get(userID: string): Promise<?BattleCommandsSchema> {
    const result = await this._client.get({
      TableName: this._tableName,
      Key: {userID},
    }).promise();
    return result?.Item ?? null;
  }
}