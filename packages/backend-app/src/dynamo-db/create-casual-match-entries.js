// @flow

import { DynamoDB } from "aws-sdk";

import { CasualMatchEntries } from "./casual-match-entries";

/**
 * casual-match-entries テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createCasualMatchEntries(
  client: typeof DynamoDB.DocumentClient,
  service: string,
  stage: string
): CasualMatchEntries {
  const tableName = `${service}__${stage}__casual-match-entries`;
  return new CasualMatchEntries(client, tableName);
}
