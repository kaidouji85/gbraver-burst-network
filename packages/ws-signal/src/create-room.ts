import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createRoomID } from "./core/create-room-id";
import { DynamoConnections } from "./dynamo-db/dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRooms } from "./dynamo-db/dynamo-rooms";
import { CreateRoom, CreateRoomSchema } from "./request/create-room";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** DynamoDB connection テーブル名 */
const DYNAMODB_CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE ?? "";
/** DynamoDB rooms テーブル名 */
const DYNAMODB_ROOMS_TABLE = process.env.DYNAMODB_ROOMS_TABLE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
/** ルーム作成リトライ回数 */
const MAX_ROOM_CREATION_RETRY = 5;

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
 * リトライありでルーム生成をする
 * @param connectionId コネクションID
 * @param body リクエストボディ
 * @returns 生成できた場合はルームID、生成できなかった場合はnull
 */
async function createRoomWithRetry(connectionId: string, body: CreateRoom) {
  for (let i = 0; i < MAX_ROOM_CREATION_RETRY; i++) {
    const roomID = createRoomID();
    const { sdp, iceCandidates } = body;
    const isRoomCreationSuccessful = await dynamoRooms.put({
      roomID,
      hostConnectionId: connectionId,
      hostSignal: { sdp, iceCandidates },
    });
    if (isRoomCreationSuccessful) {
      return roomID;
    }
  }
  return null;
}

/**
 * Websocket API create-room エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function createRoom(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const parsedBody = JSON.parse(event.body || "");
  const createRoom = CreateRoomSchema.safeParse(parsedBody);
  const { connectionId } = event.requestContext;
  if (!createRoom.success) {
    await notifier.notifyToClient(connectionId, {
      type: "room-creation-result",
      isSuccess: false,
    });
    return { statusCode: 400, body: "invalid request" };
  }

  const roomID = await createRoomWithRetry(connectionId, createRoom.data);
  if (!roomID) {
    await notifier.notifyToClient(connectionId, {
      type: "room-creation-result",
      isSuccess: false,
    });
    return { statusCode: 200, body: "create-room failed" };
  }

  await Promise.all([
    dynamoConnections.put({
      connectionId,
      state: { type: "room-host", roomID },
    }),
    notifier.notifyToClient(connectionId, {
      type: "room-creation-result",
      isSuccess: true,
      roomID,
    }),
  ]);
  return { statusCode: 200, body: "create-room success" };
}
