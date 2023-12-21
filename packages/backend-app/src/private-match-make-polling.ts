import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { isValidPrivateMatch } from "./core/is-valid-private-match";
import { privateMatchMake } from "./core/private-match-make";
import { startPrivateMatch } from "./core/start-private-match";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoPrivateMatchEntries } from "./dynamo-db/create-dynamo-private-match-entries";
import { createDynamoPrivateMatchRooms } from "./dynamo-db/create-dynamo-private-match-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { endPrivateMatchMakePolling } from "./lambda/end-private-match-make-polling";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { invalidRequestBody } from "./lambda/invalid-request-body";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parsePrivateMatchMakePolling } from "./request/private-match-make-polling";
import { cloudNotPrivateMatchMake } from "./response/cloud-not-private-match-make";
import { createBattleStart } from "./response/create-battle-start";
import { invalidRequestBodyError } from "./response/invalid-request-body-error";
import { rejectPrivateMatchEntry } from "./response/reject-private-match-entry";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const dynamoDB = createDynamoDBDocument(AWS_REGION);
const dynamoPrivateMatchRooms = createDynamoPrivateMatchRooms(
  dynamoDB,
  SERVICE,
  STAGE,
);
const dynamoPrivateMatchEntries = createDynamoPrivateMatchEntries(
  dynamoDB,
  SERVICE,
  STAGE,
);
const dynamoBattles = createDynamoBattles(dynamoDB, SERVICE, STAGE);
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);

/**
 * プライベートマッチメイクポーリング
 * @param event イベント
 * @return レスポンス
 */
export async function privateMatchMakePolling(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parsePrivateMatchMakePolling(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestBodyError,
    );
    return invalidRequestBody;
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const [room, entries] = await Promise.all([
    dynamoPrivateMatchRooms.get(user.userID),
    dynamoPrivateMatchEntries.getEntries(data.roomID),
  ]);
  if (!room || !isValidPrivateMatch({ owner: user, room, entries })) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      cloudNotPrivateMatchMake,
    );
    return endPrivateMatchMakePolling;
  }

  const matching = privateMatchMake(room, entries);
  if (!matching) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      cloudNotPrivateMatchMake,
    );
    return endPrivateMatchMakePolling;
  }

  const { battle, battleConnections, notChosenConnections } = startPrivateMatch(
    entries,
    matching,
  );
  await Promise.all([
    dynamoBattles.put(battle),
    ...battleConnections.map((v) => dynamoConnections.put(v)),
    ...notChosenConnections.map((v) => dynamoConnections.put(v)),
    ...entries.map(({ roomID, userID }) =>
      dynamoPrivateMatchEntries.delete(roomID, userID),
    ),
    dynamoPrivateMatchRooms.delete(user.userID),
    ...matching.map(({ connectionId, userID }) =>
      notifier.notifyToClient(connectionId, createBattleStart(userID, battle)),
    ),
    ...notChosenConnections.map(({ connectionId }) =>
      notifier.notifyToClient(connectionId, rejectPrivateMatchEntry),
    ),
  ]);
  return endPrivateMatchMakePolling;
}
