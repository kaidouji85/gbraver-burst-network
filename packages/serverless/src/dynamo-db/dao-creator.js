// @flow

import {DynamoDB} from "aws-sdk";
import {GbraverBurstConnections} from "./gbraver-burst-connections";
import {CasualMatchEntries} from "./casual-match-entries";
import {BattleCommands} from "./battle-commands";
import {Battles} from "./battles";

/**
 * connections テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createGbraverBurstConnections(client: typeof DynamoDB.DocumentClient, service: string, stage: string): GbraverBurstConnections {
  const tableName = `${service}__${stage}__connections`;
  return new GbraverBurstConnections(client, tableName);
}

/**
 * casual-match-entries テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createCasualMatchEntries(client: typeof DynamoDB.DocumentClient, service: string, stage: string): CasualMatchEntries {
  const tableName = `${service}__${stage}__casual-match-entries`;
  return new CasualMatchEntries(client, tableName);
}

/**
 * battle-commands テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createBattleCommands(client: typeof DynamoDB.DocumentClient, service: string, stage: string): BattleCommands {
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
export function createBattles(client: typeof DynamoDB.DocumentClient, service: string, stage: string): Battles {
  const tableName = `${service}__${stage}__battles`;
  return new Battles(client, tableName);
}
