import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** サービス名 */
const SERVICE = process.env.SERVICE ?? "";
/** ステージ名 */
const STAGE = process.env.STAGE ?? "";

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB DAO connections */
const dynamoConnections = createDynamoConnections({
  dynamoDB,
  service: SERVICE,
  stage: STAGE,
});

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
