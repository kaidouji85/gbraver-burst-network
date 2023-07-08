import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { PrivateMatchEntries } from "./private-match-entries";

/**
 * private-match-entries テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createPrivateMatchEntries(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): PrivateMatchEntries {
  const tableName = `${service}__${stage}__private-match-entries`;
  return new PrivateMatchEntries(dynamoDB, tableName);
}
