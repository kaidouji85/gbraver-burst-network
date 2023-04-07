import { PrivateMatchEntries } from "./private-match-entries";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

/**
 * private-match-entries テーブル DAO を生成する
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createPrivateMatchEntries(
  client: DynamoDBDocument,
  service: string,
  stage: string
): PrivateMatchEntries {
  const tableName = `${service}__${stage}__private-match-entries`;
  return new PrivateMatchEntries(client, tableName);
}
