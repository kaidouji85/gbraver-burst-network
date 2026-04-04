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
import { createBattleStart } from "./response/battle-start";
import { CLOUD_NOT_PRIVATE_MATCH_MAKE } from "./response/cloud-not-private-match-make";
import { INVALID_REQUEST_BODY_ERROR } from "./response/error";
import { REJECT_PRIVATE_MATCH_ENTRY } from "./response/reject-private-match-entry";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** サービス名 */
const SERVICE = process.env.SERVICE ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** WebSocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

/** DynamoDBDocument */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB DAO private-match-rooms */
const dynamoPrivateMatchRooms = createDynamoPrivateMatchRooms(
  dynamoDB,
  SERVICE,
  STAGE,
);
/** DynamoDB DAO private-match-entries */
const dynamoPrivateMatchEntries = createDynamoPrivateMatchEntries(
  dynamoDB,
  SERVICE,
  STAGE,
);
/** DynamoDB DAO battles */
const dynamoBattles = createDynamoBattles(dynamoDB, SERVICE, STAGE);
/** DynamoDB DAO connections */
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);

/** API Gateway エンドポイント */
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
/** API Gateway管理オブジェクト */
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
/** 通知オブジェクト */
const notifier = new Notifier(apiGateway);

/**
 * プライベートマッチメイクポーリング
 * @param event イベント
 * @returns レスポンス
 */
export async function privateMatchMakePolling(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parsePrivateMatchMakePolling(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      INVALID_REQUEST_BODY_ERROR,
    );
    return invalidRequestBody;
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );
  const [room, entries] = await Promise.all([
    dynamoPrivateMatchRooms.get(data.roomID),
    dynamoPrivateMatchEntries.getEntries(data.roomID),
  ]);
  if (!room || !isValidPrivateMatch({ owner: user, room, entries })) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      CLOUD_NOT_PRIVATE_MATCH_MAKE,
    );
    return endPrivateMatchMakePolling;
  }

  const matching = privateMatchMake(room, entries);
  if (!matching) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      CLOUD_NOT_PRIVATE_MATCH_MAKE,
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
    ...battleConnections.map(({ connectionId, userID }) =>
      notifier.notifyToClient(connectionId, createBattleStart(userID, battle)),
    ),
    ...notChosenConnections.map((v) => dynamoConnections.put(v)),
    ...notChosenConnections.map(({ connectionId }) =>
      notifier.notifyToClient(connectionId, REJECT_PRIVATE_MATCH_ENTRY),
    ),
    ...entries.map(({ roomID, userID }) =>
      dynamoPrivateMatchEntries.delete(roomID, userID),
    ),
    dynamoPrivateMatchRooms.delete(data.roomID),
  ]);
  return endPrivateMatchMakePolling;
}
