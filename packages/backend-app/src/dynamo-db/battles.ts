import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";

import { Battle, BattleIDSchema, BattlePlayer, BattlePlayerSchema,FlowIDSchema } from "../core/battle";

/**
 * battlesのDynamoDBスキーマ
 * パーティションキー battleID
 */
export type DynamoBattle = Battle<BattlePlayer>;

/** DynamoBattles zodスキーマ */
export const DynamoBattlesSchema = z.object({
  battleID: BattleIDSchema,
  flowID: FlowIDSchema,
  players: z.tuple([BattlePlayerSchema, BattlePlayerSchema]),
  poller: z.string(),
  stateHistory: z.array(z.any()),
});

/** battlesのDAO*/
export class Battles {
  /** DynamoDBドキュメント */
  #dynamoDB: DynamoDBDocument;
  /** テーブル名 */
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
   * @param battle 追加する項目
   * @return 処理が完了したら発火するPromise
   */
  async put(battle: DynamoBattle): Promise<void> {
    await this.#dynamoDB.put({
      TableName: this.#tableName,
      Item: battle,
    });
  }

  /**
   * バトルID指定でアイテムを検索する
   * 検索条件に合致するアイテムがない場合は、nullを返す
   * @param battleID バトルID
   * @return 検索結果
   */
  async get(battleID: string): Promise<DynamoBattle | null> {
    const result = await this.#dynamoDB.get({
      TableName: this.#tableName,
      Key: {
        battleID,
      },
    });
    return result.Item ? (DynamoBattlesSchema.parse(result.Item)) : null;
  }

  /**
   * パーティションキー指定で項目を削除する
   * @param battleID バトルID
   * @return 削除受付したら発火するPromise
   */
  async delete(battleID: string): Promise<void> {
    await this.#dynamoDB.delete({
      TableName: this.#tableName,
      Key: {
        battleID,
      },
    });
  }
}
