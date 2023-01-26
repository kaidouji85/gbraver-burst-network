import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { isValidPrivateMatch } from "./core/is-valid-private-match";
import { PrivateMatchEntry } from "./core/private-match-entry";
import { PrivateMatchRoom } from "./core/private-match-room";
import { createDynamoDBClient } from "./dynamo-db/client";
import { createPrivateMatchEntries } from "./dynamo-db/create-private-match-entries";
import { createPrivateMatchRooms } from "./dynamo-db/create-private-match-rooms";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parsePrivateMatchMakePolling } from "./request/private-match-make-polling";
import type {
  CouldNotPrivateMatchMaking,
  Error,
} from "./response/websocket-response";

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
const cloudNotPrivateMatchMake: CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making",
};

const invalidRequestBody: WebsocketAPIResponse = {
  statusCode: 400,
  body: "invalid request body",
};
const endPrivateMatchMakePolling: WebsocketAPIResponse = {
  statusCode: 200,
  body: "end private match make polling",
};

/**
 * プライベートマッチメイクポーリング
 * @param event イベント
 * @return レスポンス
 */
export async function privateMatchMakePolling(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parsePrivateMatchMakePolling(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestBodyError
    );
    return invalidRequestBody;
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer
  );
  const [fetchedRoom, fetchedEntries] = await Promise.all([
    privateMatchRooms.get(user.userID),
    privateMatchEntries.getEntries(data.roomID),
  ]);
  if (!fetchedRoom) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      cloudNotPrivateMatchMake
    );
    return endPrivateMatchMakePolling;
  }

  const room: PrivateMatchRoom = fetchedRoom;
  const entries: PrivateMatchEntry[] = fetchedEntries;
  if (!isValidPrivateMatch({ owner: user, room, entries })) {
    const testData = {...cloudNotPrivateMatchMake, message: "is not valid private match."};
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      testData
    );
    return endPrivateMatchMakePolling;
  }

  return endPrivateMatchMakePolling;
}
