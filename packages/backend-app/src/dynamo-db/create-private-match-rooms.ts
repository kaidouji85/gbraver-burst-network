import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { PrivateMatchRooms } from "./private-match-rooms";

/**
 * private-match-rooms テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createPrivateMatchRooms(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string
): PrivateMatchRooms {
  const tableName = `${service}__${stage}__private-match-rooms`;
  return new PrivateMatchRooms(dynamoDB, tableName);
}
