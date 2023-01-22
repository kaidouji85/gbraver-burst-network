import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { generatePrivateMatchRoomID } from "./core/generate-private-match-room-id";
import { parseJSON } from "./json/parse";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseCreatePrivateMatchRoom } from "./request/create-private-match-room";
import { Error } from "./response/websocket-response";

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
 * Websocket API createPrivateMatchRoom エントリポイント
 * @param event イベント
 * @return レスポンス
 */
export async function createPrivateMatchRoom(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseCreatePrivateMatchRoom(body);
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

  await notifier.notifyToClient(event.requestContext.connectionId, {
    action: "created-private-match-room",
    roomID: generatePrivateMatchRoomID(),
  });
  return {
    statusCode: 200,
    body: "create private match room",
  };
}
