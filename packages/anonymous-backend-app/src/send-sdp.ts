import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { getChannelConnectionIds } from "./core/signaling-channel";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoSignalingChannels } from "./dynamo-db/dynamo-signaling-channels";
import { parseJSON } from "./json/parse";
import { createAPIGatewayEndpoint } from "./websocket-api/api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./websocket-api/api-gateway/management";
import { Notifier } from "./websocket-api/api-gateway/notifier";
import { SendSDPSchema } from "./websocket-api/request/send-sdp";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
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
/** DynamoDB signaling-channels DAO */
const dynamoSignalingChannels = new DynamoSignalingChannels(
  dynamoDB,
  DYNAMODB_SIGNALING_CHANNELS_TABLE,
);

/**
 * SDPを相手に送信する
 * @param event イベント
 * @returns レスポンス
 */
export const sendSDP = async (
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const { connectionId } = event.requestContext;
  const parsedBody = parseJSON(event.body);
  const sendSDPRequest = SendSDPSchema.safeParse(parsedBody);
  if (!sendSDPRequest.success) {
    await notifier.notifyToClient(connectionId, {
      type: "send-sdp-rejected",
    });
    return { statusCode: 200, body: "invalid request" };
  }

  const { signalingID, sdp } = sendSDPRequest.data;
  const signalingChannel = await dynamoSignalingChannels.get(signalingID);
  if (!signalingChannel) {
    await notifier.notifyToClient(connectionId, {
      type: "send-sdp-rejected",
    });
    return { statusCode: 200, body: "signaling channel not found" };
  }

  const channelConnectionIds = getChannelConnectionIds(signalingChannel);
  const isChannelParticipant = channelConnectionIds.includes(connectionId);
  const peerConnectionId = channelConnectionIds.find(
    (id) => id !== connectionId,
  );
  if (!isChannelParticipant || !peerConnectionId) {
    await notifier.notifyToClient(connectionId, {
      type: "send-sdp-rejected",
    });
    return { statusCode: 200, body: "not authorized to send sdp" };
  }

  await notifier.notifyToClient(peerConnectionId, {
    type: "receive-remote-sdp",
    signalingID,
    sdp,
  });
  return { statusCode: 200, body: "send sdp success" };
};
