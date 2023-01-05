import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createDynamoDBClient } from "./dynamo-db/client";
import type {
  ConnectionsSchema,
  InBattle
} from "./dynamo-db/connections";
import { createBattles } from "./dynamo-db/create-battles";
import { createCasualMatchEntries } from "./dynamo-db/create-casual-match-entries";
import { createConnections } from "./dynamo-db/create-connections";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const casualMatchEntries = createCasualMatchEntries(dynamoDB, SERVICE, STAGE);
const battles = createBattles(dynamoDB, SERVICE, STAGE);

/**
 * Websocket API $disconnect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function disconnect(
  event: WebsocketAPIEvent
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
async function cleanUp(connection: ConnectionsSchema): Promise<void> {
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

  if (connection.state.type === "CasualMatchMaking") {
    await inCasualMatchMaking();
  } else if (connection.state.type === "InBattle") {
    await inBattle(connection.state);
  }
}
