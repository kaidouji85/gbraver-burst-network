import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { BattleCommand, BattleCommandSchema } from "../core/battle-command";

/**
 * DynamoDB スキーマ battle-commands
 * パーティションキー userID
 */
type DynamoBattleCommand = BattleCommand;

/** DynamoBattleCommand zodスキーマ */
const DynamoBattleCommandSchema = BattleCommandSchema;

/** DynamoDB DAO battle-commands */
export class DynamoBattleCommands {
  #dynamoDB: DynamoDBDocument;
  #tableName: string;

  /**
   * コンストラクタ
   * @param dynamoDB DynamoDBDocument
   * @param tableName テーブル名
   */
  constructor(dynamoDB: DynamoDBDocument, tableName: string) {
    this.#dynamoDB = dynamoDB;
    this.#tableName = tableName;
  }

  /**
   * 項目追加する
   * @param command 追加する項目
   * @returns 処理が完了したら発火するPromise
   */
  async put(command: DynamoBattleCommand): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: command,
    });
  }

  /**
   * ユーザID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   * @param userID ユーザID
   * @returns 検索結果
   */
  async get(userID: string): Promise<DynamoBattleCommand | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: {
        userID,
      },
    });
    return result.Item ? DynamoBattleCommandSchema.parse(result.Item) : null;
  }
}
