import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoConnections } from "./dynamo-connections";

/**
 * connections テーブル DAO を生成する
 * @param options.dynamoDB DynamoDBDocument
 * @param options.service serverlessサービス名
 * @param options.stage serverlessステージ名
 * @returns 生成結果
 */
export function createDynamoConnections(options: {
  dynamoDB: DynamoDBDocument;
  service: string;
  stage: string;
}): DynamoConnections {
  const { dynamoDB, service, stage } = options;
  const tableName = `${service}__${stage}__connections`;
  return new DynamoConnections(dynamoDB, tableName);
}
