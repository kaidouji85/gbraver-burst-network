import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { BattleCommands } from "./battle-commands";

/**
 * battle-commands テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createBattleCommands(
  client: DynamoDBDocument,
  service: string,
  stage: string
): BattleCommands {
  const tableName = `${service}__${stage}__battle-commands`;
  return new BattleCommands(client, tableName);
}
