import { DynamoDB } from "aws-sdk";
import { Connections } from "./connections";

/**
 * connections テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createConnections(client: typeof DynamoDB.DocumentClient, service: string, stage: string): Connections {
  const tableName = `${service}__${stage}__connections`;
  return new Connections(client, tableName);
}