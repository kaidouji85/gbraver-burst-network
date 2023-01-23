import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { parseJSON } from "./json/parse";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseEnterPrivateMatchRoom } from "./request/enter-private-match-room";
import type { Error } from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);

const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};

/**
 * プライベートマッチルームエントリー
 * @param event イベント
 * @returns レスポンス
 */
export async function enterPrivateMatchRoom(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseEnterPrivateMatchRoom(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestBodyError
    );
    return {
      statusCode: 400,
      body: "invalid request body",
    };
  }

  return {
    statusCode: 200,
    body: "enter private match room",
  };
}