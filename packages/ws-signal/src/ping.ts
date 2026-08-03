import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./websocket-api/api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./websocket-api/api-gateway/management";
import { Notifier } from "./websocket-api/api-gateway/notifier";
import { Pong } from "./websocket-api/response/pong";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

/** API エンドポイント */
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
/** API Gateway Management API */
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
/** WebSocket用メッセージ通知オブジェクト */
const notifier = new Notifier(apiGateway);

/**
 * Websocket API ping エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function ping(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const data: Pong = {
    action: "pong",
    message: "welcome to gbraver burst signal server",
  };
  await notifier.notifyToClient(event.requestContext.connectionId, data);
  return { statusCode: 200, body: "ping success" };
}
