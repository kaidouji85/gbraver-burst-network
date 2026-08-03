import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./websocket/api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./websocket/api-gateway/management";
import { Notifier } from "./websocket/api-gateway/notifier";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRooms } from "./dynamo-db/dynamo-rooms";
import { parseJSON } from "./json/parse";
import { JoinRoomSchema } from "./websocket/request/join-room";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
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
  const parsedBody = parseJSON(event.body);
  const parsedJoinRoom = JoinRoomSchema.safeParse(parsedBody);
  const { connectionId: guestConnectionId } = event.requestContext;
  if (!parsedJoinRoom.success) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const joinRoomRequest = parsedJoinRoom.data;
  const { roomID } = joinRoomRequest;
  if (roomID === "") {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const updatedRoom = await dynamoRooms.updateToAwaitingGuestSignal(roomID);
  if (!updatedRoom) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const { reservationID } = updatedRoom;
  const { sdp, iceCandidates } = updatedRoom.hostSignal;
  await notifier.notifyToClient(guestConnectionId, {
    type: "join-room-accepted",
    reservationID,
    sdp,
    iceCandidates,
  });
  return { statusCode: 200, body: "join room success" };
}
