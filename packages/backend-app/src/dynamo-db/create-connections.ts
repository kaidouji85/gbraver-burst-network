import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { Connections } from "./connections";

/**
 * connections テーブル DAO を生成する
 *
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createConnections(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): Connections {
  const tableName = `${service}__${stage}__connections`;
  return new Connections(dynamoDB, tableName);
}
