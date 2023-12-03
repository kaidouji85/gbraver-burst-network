import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { BattlePlayer } from "./core/battle";
import { InBattle, None } from "./core/connection";
import { createBattle } from "./core/create-battle";
import { createBattlePlayer } from "./core/create-battle-player";
import { isValidPrivateMatch } from "./core/is-valid-private-match";
import { notChosenPrivateMatchEntries } from "./core/not-chosen-private-match-entries";
import { privateMatchMake } from "./core/private-match-make";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoPrivateMatchEntries } from "./dynamo-db/create-dynamo-private-match-entries";
import { createDynamoPrivateMatchRooms } from "./dynamo-db/create-dynamo-private-match-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parsePrivateMatchMakePolling } from "./request/private-match-make-polling";
import { createBattleStart } from "./response/create-battle-start";
import type {
  CouldNotPrivateMatchMaking,
  Error,
  RejectPrivateMatchEntry,
} from "./response/websocket-response";

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

const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};
const cloudNotPrivateMatchMake: CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making",
};
const rejectPrivateMatchEntry: RejectPrivateMatchEntry = {
  action: "reject-private-match-entry",
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

  const players: [BattlePlayer, BattlePlayer] = [
    createBattlePlayer(matching[0]),
    createBattlePlayer(matching[1]),
  ];
  const battle = createBattle(players);
  const inBattleState: InBattle = {
    type: "InBattle",
    battleID: battle.battleID,
    players,
  };
  const battleConnections = matching.map((v) => ({
    connectionId: v.connectionId,
    userID: v.userID,
    state: inBattleState,
  }));
  const notChosenEntries = notChosenPrivateMatchEntries(matching, entries);
  const noneState: None = {
    type: "None",
  };
  const notChosenConnections = notChosenEntries.map((v) => ({
    connectionId: v.connectionId,
    userID: v.userID,
    state: noneState,
  }));
  await Promise.all([
    dynamoBattles.put(battle),
    ...battleConnections.map((v) => dynamoConnections.put(v)),
    ...matching.map((v) =>
      notifier.notifyToClient(
        v.connectionId,
        createBattleStart(v.userID, battle),
      ),
    ),
    dynamoPrivateMatchRooms.delete(user.userID),
    ...entries.map((v) => dynamoPrivateMatchEntries.delete(v.roomID, v.userID)),
    ...notChosenEntries.map((v) =>
      notifier.notifyToClient(v.connectionId, rejectPrivateMatchEntry),
    ),
    ...notChosenConnections.map((v) => dynamoConnections.put(v)),
  ]);

  return endPrivateMatchMakePolling;
}
