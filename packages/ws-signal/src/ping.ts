import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { Pong } from "./response/pong";

const AWS_REGION = process.env.AWS_REGION ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
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
