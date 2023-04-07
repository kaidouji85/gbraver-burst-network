import { Connections } from "./connections";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

/**
 * connections テーブル DAO を生成する
 *
 * @param client DynamoDBクライアント
 * @param service serverlessサービス名
 * @param stage serverlessステージ名
 * @return 生成結果
 */
export function createConnections(
  client: DynamoDBDocument,
  service: string,
  stage: string
): Connections {
  const tableName = `${service}__${stage}__connections`;
  return new Connections(client, tableName);
}
