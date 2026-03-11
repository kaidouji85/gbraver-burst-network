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
import { CreateRoomSchema } from "./request/create-room";

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

  const roomID = "あおえいさ"; // ルームIDの生成ロジックは後で実装する
  const { sdp, iceCandidates } = createRoom.data;
  const isRoomCreationSuccessful = await dynamoRooms.put({
    roomID,
    hostConnectionId: connectionId,
    hostSignal: { sdp, iceCandidates },
  });
  if (!isRoomCreationSuccessful) {
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
