import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoCasualMatchEntries } from "./dynamo-casual-match-entries";

/**
 * casual-match-entries テーブル DAO を生成する
 *
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createDynamoCasualMatchEntries(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoCasualMatchEntries {
  const tableName = `${service}__${stage}__casual-match-entries`;
  return new DynamoCasualMatchEntries(dynamoDB, tableName);
}
