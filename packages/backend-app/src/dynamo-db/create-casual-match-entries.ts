import { CasualMatchEntries } from "./casual-match-entries";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

/**
 * casual-match-entries テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createCasualMatchEntries(
  client: DynamoDBDocument,
  service: string,
  stage: string
): CasualMatchEntries {
  const tableName = `${service}__${stage}__casual-match-entries`;
  return new CasualMatchEntries(client, tableName);
}
