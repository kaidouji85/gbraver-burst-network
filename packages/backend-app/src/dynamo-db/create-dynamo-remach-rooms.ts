import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoRematchRooms } from "./dynamo-rematch-rooms";

/**
 * rematch-rooms テーブル DAO を生成する
 * @param dynamoDB DynamoDBDocument
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @returns 生成結果
 */
export function createDynamoRematchRooms(
  dynamoDB: DynamoDBDocument,
  service: string,
  stage: string,
): DynamoRematchRooms {
  const tableName = `${service}__${stage}__rematch-rooms`;
  return new DynamoRematchRooms(dynamoDB, tableName);
}
