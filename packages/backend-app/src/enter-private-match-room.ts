import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { PrivateMatchEntry } from "./core/private-match-entry";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoPrivateMatchEntries } from "./dynamo-db/create-dynamo-private-match-entries";
import { createDynamoPrivateMatchRooms } from "./dynamo-db/create-dynamo-private-match-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseEnterPrivateMatchRoom } from "./request/enter-private-match-room";
import type {
  Error,
  RejectPrivateMatchEntry,
} from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const dynamoDB = createDynamoDBDocument(AWS_REGION);
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);
const dynamoPrivateMatchRooms = createDynamoPrivateMatchRooms(dynamoDB, SERVICE, STAGE);
const dynamoPrivateMatchEntries = createDynamoPrivateMatchEntries(dynamoDB, SERVICE, STAGE);

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);

const invalidRequestBody: WebsocketAPIResponse = {
  statusCode: 400,
  body: "invalid request body",
};

const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};
const rejectPrivateMatchEntry: RejectPrivateMatchEntry = {
  action: "reject-private-match-entry",
};

/**
 * プライベートマッチルームエントリー
 * @param event イベント
 * @returns レスポンス
 */
export async function enterPrivateMatchRoom(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseEnterPrivateMatchRoom(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestBodyError,
    );
    return invalidRequestBody;
  }

  if (data.roomID === "") {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      rejectPrivateMatchEntry,
    );
    return invalidRequestBody;
  }

  const isExistRoom = await dynamoPrivateMatchRooms.isExistRoom(data.roomID);
  if (!isExistRoom) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      rejectPrivateMatchEntry,
    );
    return invalidRequestBody;
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const entry: PrivateMatchEntry = {
    roomID: data.roomID,
    userID: user.userID,
    armdozerId: data.armdozerId,
    pilotId: data.pilotId,
    connectionId: event.requestContext.connectionId,
  };
  await Promise.all([
    dynamoPrivateMatchEntries.put(entry),
    dynamoConnections.put({
      connectionId: event.requestContext.connectionId,
      userID: user.userID,
      state: {
        type: "PrivateMatchMaking",
        roomID: data.roomID,
      },
    }),
  ]);

  return {
    statusCode: 200,
    body: "enter private match room",
  };
}
