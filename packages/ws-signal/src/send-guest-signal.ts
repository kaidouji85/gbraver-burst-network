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
import { parseJSON } from "./json/parse";
import { SendGuestSignalSchema } from "./request/send-guest-signal";

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
 * Websocket API send-guest-signal エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function sendGuestSignal(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const { connectionId: guestConnectionId } = event.requestContext;
  const parsedBody = parseJSON(event.body);
  const parsedSendGuestSignal = SendGuestSignalSchema.safeParse(parsedBody);
  if (!parsedSendGuestSignal.success) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "send-guest-signal-rejected",
    });
    return { statusCode: 200, body: "send-guest-signal rejected" };
  }

  const sendGuestSignalRequest = parsedSendGuestSignal.data;
  const { roomID, reservationID } = sendGuestSignalRequest;
  const deletedRoom = await dynamoRooms.delete({ roomID, reservationID });
  if (!deletedRoom) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "send-guest-signal-rejected",
    });
    return { statusCode: 200, body: "send-guest-signal rejected" };
  }

  const { sdp: guestSdp, iceCandidates: guestIceCandidates } =
    sendGuestSignalRequest;
  const { hostConnectionId, hostSignal } = deletedRoom;
  await Promise.all([
    notifier.notifyToClient(guestConnectionId, {
      type: "matching",
      sdp: hostSignal.sdp,
      iceCandidates: hostSignal.iceCandidates,
    }),
    notifier.notifyToClient(hostConnectionId, {
      type: "matching",
      sdp: guestSdp,
      iceCandidates: guestIceCandidates,
    }),
    dynamoConnections.put({
      connectionId: hostConnectionId,
      state: { type: "none" },
    }),
  ]);
  return { statusCode: 200, body: "send-guest-signal success" };
}
