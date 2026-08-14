import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

import { getChannelConnectionIds } from "./core/signaling-channel";
import { DynamoConnections } from "./dynamo-db/dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { DynamoSignalingChannels } from "./dynamo-db/dynamo-signaling-channels";
import { parseJSON } from "./json/parse";
import { createAPIGatewayEndpoint } from "./websocket-api/api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./websocket-api/api-gateway/management";
import { Notifier } from "./websocket-api/api-gateway/notifier";
import { DeleteSignalingChannelSchema } from "./websocket-api/request/delete-signaling-channel";

/** AWSリージョン */
const AWS_REGION = process.env.AWS_REGION ?? "";
/** ステージ */
const STAGE = process.env.STAGE ?? "";
/** Websocket API ID */
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
/** DynamoDB connections テーブル名 */
const DYNAMODB_CONNECTIONS_TABLE = process.env.DYNAMODB_CONNECTIONS_TABLE ?? "";
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
/** DynamoDB connections DAO */
const dynamoConnections = new DynamoConnections(
  dynamoDB,
  DYNAMODB_CONNECTIONS_TABLE,
);
/** DynamoDB signaling-channels DAO */
const dynamoSignalingChannels = new DynamoSignalingChannels(
  dynamoDB,
  DYNAMODB_SIGNALING_CHANNELS_TABLE,
);

/**
 * シグナリングチャネルを削除する
 * @param event イベント
 * @returns レスポンス
 */
export const deleteSignalingChannel = async (
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const { connectionId } = event.requestContext;
  const parsedBody = parseJSON(event.body);
  const deleteSignalingChannelRequest =
    DeleteSignalingChannelSchema.safeParse(parsedBody);
  if (!deleteSignalingChannelRequest.success) {
    await notifier.notifyToClient(connectionId, {
      type: "delete-signaling-channel-rejected",
    });
    return { statusCode: 400, body: "invalid request" };
  }

  const { signalingID } = deleteSignalingChannelRequest.data;
  const deletedChannel = await dynamoSignalingChannels.delete(signalingID);
  if (!deletedChannel) {
    await notifier.notifyToClient(connectionId, {
      type: "delete-signaling-channel-rejected",
    });
    return { statusCode: 404, body: "signaling channel not found." };
  }

  await Promise.all([
    ...getChannelConnectionIds(deletedChannel).map((id) =>
      dynamoConnections.put({ connectionId: id, state: { type: "none" } }),
    ),
    notifier.notifyToClient(connectionId, {
      type: "delete-signaling-channel-accepted",
    }),
  ]);
  return { statusCode: 200, body: "delete signaling channel success" };
};
