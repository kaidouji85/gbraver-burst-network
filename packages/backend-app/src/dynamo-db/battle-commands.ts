import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { BattleCommand } from "../core/battle-command";

/**
 * battle-commands のスキーマ
 * パーティションキー userID
 */
export type BattleCommandsSchema = BattleCommand;

/** battle-commandsのDAO */
export class BattleCommands {
  #dynamoDB: DynamoDBDocument;
  #tableName: string;

  /**
   * コンストラクタ
   *
   * @param dynamoDB DynamoDBDocument
   * @param tableName テーブル名
   */
  constructor(dynamoDB: DynamoDBDocument, tableName: string) {
    this.#dynamoDB = dynamoDB;
    this.#tableName = tableName;
  }

  /**
   * 項目追加する
   *
   * @param command 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(command: BattleCommandsSchema): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
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
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: {
        userID,
      },
    });
    return result.Item ? (result.Item as BattleCommandsSchema) : null;
  }
}
