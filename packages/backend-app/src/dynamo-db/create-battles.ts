import { DynamoDB } from "aws-sdk";
import { Battles } from "./battles";

/**
 * battles テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createBattles(client: DynamoDB.DocumentClient, service: string, stage: string): Battles {
  const tableName = `${service}__${stage}__battles`;
  return new Battles(client, tableName);
}