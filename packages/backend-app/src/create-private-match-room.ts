import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { generatePrivateMatchRoomID } from "./core/generate-private-match-room-id";
import { PrivateMatchRoom } from "./core/private-match-room";
import { createDynamoDBClient } from "./dynamo-db/client";
import { createConnections } from "./dynamo-db/create-connections";
import { createPrivateMatchRooms } from "./dynamo-db/create-private-match-rooms";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseCreatePrivateMatchRoom } from "./request/create-private-match-room";
import { Error } from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const privateMatchRooms = createPrivateMatchRooms(dynamoDB, SERVICE, STAGE);

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

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer
  );
  const room: PrivateMatchRoom = {
    roomID: generatePrivateMatchRoomID(),
    owner: user.userID,
    armdozerId: data.armdozerId,
    pilotId: data.pilotId,
  };
  await Promise.all([
    privateMatchRooms.put(room),
    connections.put({
      connectionId: event.requestContext.connectionId,
      userID: user.userID,
      state: {
        type: "HoldPrivateMatch",
      },
    }),
    notifier.notifyToClient(event.requestContext.connectionId, {
      action: "created-private-match-room",
      roomID: room.roomID,
    }),
  ]);

  return {
    statusCode: 200,
    body: "create private match room",
  };
}
