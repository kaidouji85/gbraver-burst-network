import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { DynamoConnections } from "./dynamo-db/dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRooms } from "./dynamo-db/dynamo-rooms";
import { JoinRoomSchema } from "./request/join-room";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
/** DynamoDB connection テーブル名 */
const DYNAMODB_CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE ?? "";
/** DynamoDB rooms テーブル名 */
const DYNAMODB_ROOMS_TABLE = process.env.DYNAMODB_ROOMS_TABLE ?? "";

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
/** DynamoDB connections DAO */
const dynamoConnections = new DynamoConnections(
  dynamoDB,
  DYNAMODB_CONNECTIONS_TABLE,
);
/** DynamoDB rooms DAO */
const dynamoRooms = new DynamoRooms(dynamoDB, DYNAMODB_ROOMS_TABLE);

/**
 * ゲストが入室する
 * @param event イベント
 * @returns レスポンス
 */
export async function joinRoom(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const parsedBody = JSON.parse(event.body || "");
  const joinRoom = JoinRoomSchema.safeParse(parsedBody);
  const { connectionId: guestConnectionId } = event.requestContext;
  if (!joinRoom.success) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const { roomId } = joinRoom.data;
  const deletedRoom = await dynamoRooms.deleteAndReturnOld(roomId);
  if (!deletedRoom) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const { sdp: guestSdp, iceCandidates: guestIceCandidates } = joinRoom.data;
  const { hostConnectionId, hostSignal } = deletedRoom;
  await Promise.all([
    dynamoConnections.put({
      connectionId: hostConnectionId,
      state: { type: "none" },
    }),
    notifier.notifyToClient(hostConnectionId, {
      type: "matching",
      sdp: guestSdp,
      iceCandidates: guestIceCandidates,
    }),
    notifier.notifyToClient(guestConnectionId, {
      type: "matching",
      sdp: hostSignal.sdp,
      iceCandidates: hostSignal.iceCandidates,
    }),
  ]);
  return { statusCode: 200, body: "join room success" };
}
