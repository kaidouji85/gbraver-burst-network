import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { CasualMatchEntries } from "./casual-match-entries";

/**
 * casual-match-entries テーブル DAO を生成する
 *
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createCasualMatchEntries(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string
): CasualMatchEntries {
  const tableName = `${service}__${stage}__casual-match-entries`;
  return new CasualMatchEntries(dynamoDB, tableName);
}
