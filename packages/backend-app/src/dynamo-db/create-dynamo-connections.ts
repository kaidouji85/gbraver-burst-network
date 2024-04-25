import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoConnections } from "./dynamo-connections";

/**
 * connections テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @returns 生成結果
 */
export function createDynamoConnections(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoConnections {
  const tableName = `${service}__${stage}__connections`;
  return new DynamoConnections(dynamoDB, tableName);
}
