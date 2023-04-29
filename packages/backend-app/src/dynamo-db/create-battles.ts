import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { Battles } from "./battles";

/**
 * battles テーブル DAO を生成する
 *
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createBattles(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string
): Battles {
  const tableName = `${service}__${stage}__battles`;
  return new Battles(dynamoDB, tableName);
}
