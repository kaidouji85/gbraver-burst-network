import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { Signaling } from "./core/connection/signaling";
import { getChannelConnectionIds } from "./core/signaling-channel";
import { DynamoConnections } from "./dynamo-db/dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRooms } from "./dynamo-db/dynamo-rooms";
import { DynamoSignalingChannels } from "./dynamo-db/dynamo-signaling-channels";
import { createAPIGatewayEndpoint } from "./websocket-api/api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./websocket-api/api-gateway/management";
import { Notifier } from "./websocket-api/api-gateway/notifier";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
/** DynamoDB connections テーブル名 */
const DYNAMODB_CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE ?? "";
/** DynamoDB rooms テーブル名 */
const DYNAMODB_ROOMS_TABLE = process.env.DYNAMODB_ROOMS_TABLE ?? "";
/** DynamoDB signaling-channels テーブル名 */
const DYNAMODB_SIGNALING_CHANNELS_TABLE =
  process.env.DYNAMODB_SIGNALING_CHANNELS_TABLE ?? "";

/** API エンドポイント */
const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
/** API Gateway Management API */
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
/** WebSocket用メッセージ通知オブジェクト */
const notifier = new Notifier(apiGateway);

/** DynamoDB ドキュメントクライアント */
const dynamoDB = createDynamoDBDocument(AWS_REGION);
/** DynamoDB DAO connections */
const dynamoConnections = new DynamoConnections(
  dynamoDB,
  DYNAMODB_CONNECTIONS_TABLE,
);
/** DynamoDB DAO rooms */
const dynamoRooms = new DynamoRooms(dynamoDB, DYNAMODB_ROOMS_TABLE);
/** DynamoDB signaling-channels DAO */
const dynamoSignalingChannels = new DynamoSignalingChannels(
  dynamoDB,
  DYNAMODB_SIGNALING_CHANNELS_TABLE,
);

/**
 * シグナリング中に接続が切断された場合の処理
 * @param signaling シグナリンング中のステート
 * @returns 処理が完了したら発火するPromise
 */
const onSignaling = async (signaling: Signaling) => {
  const { signalingID } = signaling;
  const deletedSignalingChannel =
    await dynamoSignalingChannels.delete(signalingID);
  if (!deletedSignalingChannel) {
    return;
  }

  const channelConnectionIds = getChannelConnectionIds(deletedSignalingChannel);
  const peerConnectionId = channelConnectionIds.find(
    (id) => id !== signaling.signalingID,
  );
  if (!peerConnectionId) {
    return;
  }
  await Promise.all([
    dynamoConnections.put({
      connectionId: peerConnectionId,
      state: { type: "none" },
    }),
    notifier.notifyToClient(peerConnectionId, {
      type: "abort-signaling",
    }),
  ]);
};

/**
 * Websocket API $disconnect エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function disconnect(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const { connectionId } = event.requestContext;
  const deletedConnection = await dynamoConnections.delete(connectionId);
  if (!deletedConnection) {
    return { statusCode: 404, body: "connection not found." };
  }

  if (deletedConnection.state.type === "room-host") {
    const { roomID } = deletedConnection.state;
    await dynamoRooms.delete(roomID);
  } else if (deletedConnection.state.type === "signaling") {
    await onSignaling(deletedConnection.state);
  }

  return { statusCode: 200, body: "disconnected." };
}
