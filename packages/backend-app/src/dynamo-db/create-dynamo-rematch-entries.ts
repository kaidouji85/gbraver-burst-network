import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoRematchEntries } from "./dynamo-rematch-entries";

/**
 * rematch-entries テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @returns 生成結果
 */
export function createDynamoRematchEntries(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoRematchEntries {
  const tableName = `${service}__${stage}__rematch-entries`;
  return new DynamoRematchEntries(dynamoDB, tableName);
}
