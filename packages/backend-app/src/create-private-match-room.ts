import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { generatePrivateMatchRoomID } from "./core/generate-private-match-room-id";
import { PrivateMatchRoom } from "./core/private-match-room";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoPrivateMatchRooms } from "./dynamo-db/create-dynamo-private-match-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
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

const dynamoDB = createDynamoDBDocument(AWS_REGION);
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);
const dynamoPrivateMatchRooms = createDynamoPrivateMatchRooms(
  dynamoDB,
  SERVICE,
  STAGE,
);

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
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
 * @returns レスポンス
 */
export async function createPrivateMatchRoom(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseCreatePrivateMatchRoom(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestBodyError,
    );
    return {
      statusCode: 400,
      body: "invalid request body",
    };
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const room: PrivateMatchRoom = {
    roomID: generatePrivateMatchRoomID(),
    owner: user.userID,
    ownerConnectionId: event.requestContext.connectionId,
    armdozerId: data.armdozerId,
    pilotId: data.pilotId,
  };
  await Promise.all([
    dynamoPrivateMatchRooms.put(room),
    dynamoConnections.put({
      connectionId: event.requestContext.connectionId,
      userID: user.userID,
      state: {
        type: "HoldPrivateMatch",
        roomID: room.roomID,
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
