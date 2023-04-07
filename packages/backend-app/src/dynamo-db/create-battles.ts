import { Battles } from "./battles";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

/**
 * battles テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverless ステージ名
 * @return 生成結果
 */
export function createBattles(
  client: DynamoDBDocument,
  service: string,
  stage: string
): Battles {
  const tableName = `${service}__${stage}__battles`;
  return new Battles(client, tableName);
}
