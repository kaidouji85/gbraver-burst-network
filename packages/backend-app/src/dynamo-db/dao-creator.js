// @flow

import { DynamoDB } from "aws-sdk";

import { BattleCommands } from "./battle-commands";
import { Battles } from "./battles";
import { CasualMatchEntries } from "./casual-match-entries";
import { Connections } from "./connections";

/**
 * connections テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createConnections(
  client: typeof DynamoDB.DocumentClient,
  service: string,
  stage: string
): Connections {
  const tableName = `${service}__${stage}__connections`;
  return new Connections(client, tableName);
}

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

/**
 * battle-commands テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createBattleCommands(
  client: typeof DynamoDB.DocumentClient,
  service: string,
  stage: string
): BattleCommands {
  const tableName = `${service}__${stage}__battle-commands`;
  return new BattleCommands(client, tableName);
}

/**
 * battles テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createBattles(
  client: typeof DynamoDB.DocumentClient,
  service: string,
  stage: string
): Battles {
  const tableName = `${service}__${stage}__battles`;
  return new Battles(client, tableName);
}
