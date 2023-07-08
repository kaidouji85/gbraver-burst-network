import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import {
  Connection,
  HoldPrivateMatch,
  InBattle,
  PrivateMatchMaking,
} from "./core/connection";
import { createBattles } from "./dynamo-db/create-battles";
import { createCasualMatchEntries } from "./dynamo-db/create-casual-match-entries";
import { createConnections } from "./dynamo-db/create-connections";
import { createPrivateMatchEntries } from "./dynamo-db/create-private-match-entries";
import { createPrivateMatchRooms } from "./dynamo-db/create-private-match-rooms";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);

const dynamoDB = createDynamoDBDocument(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const casualMatchEntries = createCasualMatchEntries(dynamoDB, SERVICE, STAGE);
const battles = createBattles(dynamoDB, SERVICE, STAGE);
const privateMatchRooms = createPrivateMatchRooms(dynamoDB, SERVICE, STAGE);
const privateMatchEntries = createPrivateMatchEntries(dynamoDB, SERVICE, STAGE);

/**
 * Websocket API $disconnect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function disconnect(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const connectionId = event.requestContext.connectionId;
  const connection = await connections.get(connectionId);
  await Promise.all([
    connections.delete(connectionId),
    connection ? cleanUp(connection) : Promise.resolve(),
  ]);
  return {
    statusCode: 200,
    body: "disconnected",
  };
}

/**
 * Websocket切断時のクリーンアップを行う
 *
 * @param connection 接続情報
 * @return クリーンアップ完了時に発火するPromise
 */
async function cleanUp(connection: Connection): Promise<void> {
  const inCasualMatchMaking = async () => {
    await casualMatchEntries.delete(connection.userID);
  };

  const inBattle = async (state: InBattle) => {
    const other =
      state.players[0].connectionId !== connection.connectionId
        ? state.players[0]
        : state.players[1];
    await Promise.all([
      notifier.notifyToClient(other.connectionId, {
        action: "suddenly-battle-end",
      }),
      connections.put({
        connectionId: other.connectionId,
        userID: other.userID,
        state: {
          type: "None",
        },
      }),
      battles.delete(state.battleID),
    ]);
  };

  const holdPrivateMatch = async (state: HoldPrivateMatch) => {
    const [entries] = await Promise.all([
      privateMatchEntries.getEntries(state.roomID),
      privateMatchRooms.delete(connection.userID),
    ]);
    await Promise.all([
      ...entries.map((v) =>
        notifier.notifyToClient(v.connectionId, {
          action: "reject-private-match-entry",
        }),
      ),
    ]);
  };

  const privateMatchMaking = async (state: PrivateMatchMaking) => {
    await privateMatchEntries.delete(state.roomID, connection.userID);
  };

  if (connection.state.type === "CasualMatchMaking") {
    await inCasualMatchMaking();
  } else if (connection.state.type === "InBattle") {
    await inBattle(connection.state);
  } else if (connection.state.type === "HoldPrivateMatch") {
    await holdPrivateMatch(connection.state);
  } else if (connection.state.type === "PrivateMatchMaking") {
    await privateMatchMaking(connection.state);
  }
}
