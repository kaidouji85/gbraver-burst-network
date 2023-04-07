import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { BattleCommand } from "../core/battle-command";

/**
 * battle-commands のスキーマ
 * パーティションキー userID
 */
export type BattleCommandsSchema = BattleCommand;

/** battle-commandsのDAO */
export class BattleCommands {
  _client: DynamoDBDocument;
  _tableName: string;

  /**
   * コンストラクタ
   *
   * @param client DynamoDBクライアント
   * @param tableName テーブル名
   */
  constructor(client: DynamoDBDocument, tableName: string) {
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
    await this._client.put({
      TableName: this._tableName,
      Item: command,
    });
  }

  /**
   * ユーザID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   *
   * @param userID ユーザID
   * @return 検索結果
   */
  async get(userID: string): Promise<BattleCommandsSchema | null> {
    const result = await this._client.get({
      TableName: this._tableName,
      Key: {
        userID,
      },
    });
    return result.Item ? (result.Item as BattleCommandsSchema) : null;
  }
}
