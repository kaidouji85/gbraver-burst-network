import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoRooms } from "./dynamo-db/dynamo-rooms";
import { DynamoSignalingChannels } from "./dynamo-db/dynamo-signaling-channels";
import { parseJSON } from "./json/parse";
import { createAPIGatewayEndpoint } from "./websocket-api/api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./websocket-api/api-gateway/management";
import { Notifier } from "./websocket-api/api-gateway/notifier";
import { JoinRoomSchema } from "./websocket-api/request/join-room";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
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
/** DynamoDB rooms DAO */
const dynamoRooms = new DynamoRooms(dynamoDB, DYNAMODB_ROOMS_TABLE);
/** DynamoDB signaling-channels DAO */
const dynamoSignalingChannels = new DynamoSignalingChannels(
  dynamoDB,
  DYNAMODB_SIGNALING_CHANNELS_TABLE,
);

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

  const updatedRoom =
    await dynamoRooms.updateToAwaitingSignalingChannelCreated(roomID);
  if (!updatedRoom) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const { hostConnectionId } = updatedRoom;
  const isSelfJoinAttempt = hostConnectionId === guestConnectionId;
  if (isSelfJoinAttempt) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "join-room-rejected",
    });
    return { statusCode: 200, body: "join room rejected" };
  }

  const signalingChannel = await dynamoSignalingChannels.put({
    hostConnectionId,
    guestConnectionId,
  });
  const { signalingID } = signalingChannel;
  await Promise.all([
    notifier.notifyToClient(guestConnectionId, {
      type: "join-room-accepted",
      signalingID,
    }),
    notifier.notifyToClient(hostConnectionId, {
      type: "matching",
      signalingID,
    }),
    dynamoRooms.delete(roomID),
  ]);
  return { statusCode: 200, body: "join room success" };
}
