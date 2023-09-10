import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoBattles } from "./dynamo-battles";

/**
 * battles テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createDynamoBattles(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoBattles {
  const tableName = `${service}__${stage}__battles`;
  return new DynamoBattles(dynamoDB, tableName);
}
