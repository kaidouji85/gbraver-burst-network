import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
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
 * Websocket API send-guest-signal エントリポイント
 * @param event イベント
 * @returns レスポンス
 */
export async function sendGuestSignal(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  const parsedBody = parseJSON(event.body);
  const parsedSendGuestSignal = SendGuestSignalSchema.safeParse(parsedBody);
  if (!parsedSendGuestSignal.success) {
    return { statusCode: 200, body: "send-guest-signal rejected" };
  }

  const sendGuestSignal = parsedSendGuestSignal.data;
  const { roomID, reservationID } = sendGuestSignal;
  const deletedRoom = await dynamoRooms.delete({ roomID, reservationID });
  if (!deletedRoom) {
    return { statusCode: 200, body: "send-guest-signal rejected" };
  }

  const { connectionId: guestConnectionId } = event.requestContext;
  const { sdp: guestSdp, iceCandidates: guestIceCandidates } = sendGuestSignal;
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
  ]);

  return { statusCode: 200, body: "send-guest-signal success" };
}
