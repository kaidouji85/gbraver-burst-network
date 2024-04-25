import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoPrivateMatchRooms } from "./dynamo-private-match-rooms";

/**
 * private-match-rooms テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @returns 生成結果
 */
export function createDynamoPrivateMatchRooms(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoPrivateMatchRooms {
  const tableName = `${service}__${stage}__private-match-rooms`;
  return new DynamoPrivateMatchRooms(dynamoDB, tableName);
}
