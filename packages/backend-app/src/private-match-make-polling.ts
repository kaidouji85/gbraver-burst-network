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
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { createBattles } from "./dynamo-db/create-battles";
import { createConnections } from "./dynamo-db/create-connections";
import { createPrivateMatchEntries } from "./dynamo-db/create-private-match-entries";
import { createPrivateMatchRooms } from "./dynamo-db/create-private-match-rooms";
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
const privateMatchRooms = createPrivateMatchRooms(dynamoDB, SERVICE, STAGE);
const privateMatchEntries = createPrivateMatchEntries(dynamoDB, SERVICE, STAGE);
const battles = createBattles(dynamoDB, SERVICE, STAGE);
const connections = createConnections(dynamoDB, SERVICE, STAGE);

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
  const [room, entries] = await Promise.all([
    privateMatchRooms.get(user.userID),
    privateMatchEntries.getEntries(data.roomID),
  ]);
  if (!room) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      cloudNotPrivateMatchMake
    );
    return endPrivateMatchMakePolling;
  }

  if (!isValidPrivateMatch({ owner: user, room, entries })) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      cloudNotPrivateMatchMake
    );
    return endPrivateMatchMakePolling;
  }

  const matching = privateMatchMake(room, entries);
  if (!matching) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      cloudNotPrivateMatchMake
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
  const notChonsenConnections = notChosenEntries.map((v) => ({
    connectionId: v.connectionId,
    userID: v.userID,
    state: noneState,
  }));
  await Promise.all([
    battles.put(battle),
    ...battleConnections.map((v) => connections.put(v)),
    ...matching.map((v) =>
      notifier.notifyToClient(
        v.connectionId,
        createBattleStart(v.userID, battle)
      )
    ),
    privateMatchRooms.delete(user.userID),
    ...entries.map((v) => privateMatchEntries.delete(v.roomID, v.userID)),
    ...notChosenEntries.map((v) =>
      notifier.notifyToClient(v.connectionId, rejectPrivateMatchEntry)
    ),
    ...notChonsenConnections.map((v) => connections.put(v)),
  ]);

  return endPrivateMatchMakePolling;
}
