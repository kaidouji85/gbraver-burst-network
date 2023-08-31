import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoBattleCommands } from "./battle-commands";

/**
 * battle-commands テーブル DAO を生成する
 *
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createBattleCommands(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoBattleCommands {
  const tableName = `${service}__${stage}__battle-commands`;
  return new DynamoBattleCommands(dynamoDB, tableName);
}
