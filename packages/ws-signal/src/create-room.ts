import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRoomsDAO } from "./dynamo-db/dynamo-room";
import { CreateRoomSchema } from "./request/create-room";
import { RoomCreationResult } from "./response/room-creation-result";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** DynamoDB room テーブル名 */
const DYNAMODB_ROOM_TABLE = process.env.DYNAMODB_ROOM_TABLE ?? "";
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
/** DynamoDB room DAO */
const dynamoRooms = new DynamoRoomsDAO(dynamoDB, DYNAMODB_ROOM_TABLE);

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
    hostSignal: { sdp, iceCandidates },
  });
  const roomCreationResult: RoomCreationResult = isRoomCreationSuccessful
    ? { type: "room-creation-result", isSuccess: true, roomID }
    : { type: "room-creation-result", isSuccess: false };
  await notifier.notifyToClient(connectionId, roomCreationResult);
  return { statusCode: 200, body: "create-room success" };
}
