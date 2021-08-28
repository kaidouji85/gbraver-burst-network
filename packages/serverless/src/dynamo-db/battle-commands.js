// @flow

import type {Command} from 'gbraver-burst-core';
import {DynamoDB} from "aws-sdk";
import type {BattleID, FlowID} from "../dto/battle";
import type {UserID} from "../dto/user";

/** battle-commands のスキーマ */
type BattleCommandsSchema = {
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
   * @param entry 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  put(entry: BattleCommandsSchema): Promise<void> {
    return this._client
      .put({TableName: this._tableName, Item: entry})
      .promise();
  }
}