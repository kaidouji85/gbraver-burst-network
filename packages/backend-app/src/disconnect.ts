import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import {
  Connection,
  HoldPrivateMatch,
  InBattle,
  PrivateMatchMaking,
} from "./core/connection";
import { createDynamoBattles } from "./dynamo-db/create-dynamo-battles";
import { createDynamoCasualMatchEntries } from "./dynamo-db/create-dynamo-casual-match-entries";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoPrivateMatchEntries } from "./dynamo-db/create-dynamo-private-match-entries";
import { createDynamoPrivateMatchRooms } from "./dynamo-db/create-dynamo-private-match-rooms";
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
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);
const dynamoCasualMatchEntries = createDynamoCasualMatchEntries(
  dynamoDB,
  SERVICE,
  STAGE,
);
const dynamoBattles = createDynamoBattles(dynamoDB, SERVICE, STAGE);
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

/**
 * Websocket API $disconnect エントリポイント
 *
 * @param event イベント
 * @returns レスポンス
 */
export async function disconnect(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const connectionId = event.requestContext.connectionId;
  const connection = await dynamoConnections.get(connectionId);
  await Promise.all([
    dynamoConnections.delete(connectionId),
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
 * @returns クリーンアップ完了時に発火するPromise
 */
async function cleanUp(connection: Connection): Promise<void> {
  const inCasualMatchMaking = async () => {
    await dynamoCasualMatchEntries.delete(connection.userID);
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
      dynamoConnections.put({
        connectionId: other.connectionId,
        userID: other.userID,
        state: {
          type: "None",
        },
      }),
      dynamoBattles.delete(state.battleID),
    ]);
  };

  const holdPrivateMatch = async (state: HoldPrivateMatch) => {
    const [entries] = await Promise.all([
      dynamoPrivateMatchEntries.getEntries(state.roomID),
      dynamoPrivateMatchRooms.delete(connection.userID),
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
    await dynamoPrivateMatchEntries.delete(state.roomID, connection.userID);
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
