import { DynamoDB } from "aws-sdk";

import { BattleCommand } from "../core/battle-command";

/**
 * battle-commands のスキーマ
 * パーティションキー UserID
 */
export type BattleCommandsSchema = BattleCommand;

/** battle-commandsのDAO */
export class BattleCommands {
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
   * @param command 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(command: BattleCommandsSchema): Promise<void> {
    await this._client
      .put({
        TableName: this._tableName,
        Item: command,
      })
      .promise();
  }

  /**
   * ユーザID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param userID ユーザID
   * @return 検索結果
   */
  async get(userID: string): Promise<BattleCommandsSchema | null> {
    const result = await this._client
      .get({
        TableName: this._tableName,
        Key: {
          userID,
        },
      })
      .promise();
    return result.Item ? (result.Item as BattleCommandsSchema) : null;
  }
}
