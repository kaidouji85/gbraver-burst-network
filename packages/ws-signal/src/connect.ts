import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { DynamoConnections } from "./dynamo-db/dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** DynamoDB connections テーブル名 */
const DYNAMODB_CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE ?? "";

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB DAO connections */
const dynamoConnections = new DynamoConnections(
  dynamoDB,
  DYNAMODB_CONNECTIONS_TABLE,
);

/**
 * Websocket API $connect エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function connect(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const { connectionId } = event.requestContext;
  await dynamoConnections.put({ connectionId, state: { type: "None" } });
  return { statusCode: 200, body: "connected." };
}
