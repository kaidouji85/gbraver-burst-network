import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { PrivateMatchEntry } from "./core/private-match-entry";
import { createDynamoDBClient } from "./dynamo-db/client";
import { createPrivateMatchEntries } from "./dynamo-db/create-private-match-entries";
import { createPrivateMatchRooms } from "./dynamo-db/create-private-match-rooms";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseEnterPrivateMatchRoom } from "./request/enter-private-match-room";
import type { Error } from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const dynamoDB = createDynamoDBClient(AWS_REGION);
const privateMatchRooms = createPrivateMatchRooms(dynamoDB, SERVICE, STAGE);
const privateMatchEntries = createPrivateMatchEntries(dynamoDB, SERVICE, STAGE);

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

  const isExistRoom = await privateMatchRooms.isExistRoom(data.roomID);
  if (!isExistRoom) {
    await notifier.notifyToClient(event.requestContext.connectionId, {
      action: "not-found-private-match-room",
    });
    return {
      statusCode: 400,
      body: "invalid request body",
    };
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer
  );
  const entry: PrivateMatchEntry = {
    roomID: data.roomID,
    userID: user.userID,
    armdozerId: data.armdozerId,
    pilotId: data.pilotId,
  };
  await Promise.all([
    privateMatchEntries.put(entry),
    notifier.notifyToClient(event.requestContext.connectionId, {
      action: "entered-private-match-room",
    }),
  ]);

  await privateMatchEntries.put(entry);

  return {
    statusCode: 200,
    body: "enter private match room",
  };
}
