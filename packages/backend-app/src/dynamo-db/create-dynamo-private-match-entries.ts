import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoPrivateMatchEntries } from "./dynamo-private-match-entries";

/**
 * private-match-entries テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @returns 生成結果
 */
export function createDynamoPrivateMatchEntries(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoPrivateMatchEntries {
  const tableName = `${service}__${stage}__private-match-entries`;
  return new DynamoPrivateMatchEntries(dynamoDB, tableName);
}
