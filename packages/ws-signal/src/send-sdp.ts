import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";

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

/**
 * SDPを相手に送信する
 * @param event イベント
 * @returns レスポンス
 */
export const sendSDP = async (
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const { connectionId: guestConnectionId } = event.requestContext;
  const parsedBody = parseJSON(event.body);
  const parsedSendSDP = SendSDPSchema.safeParse(parsedBody);
  if (parsedSendSDP.success === false) {
    await notifier.notifyToClient(guestConnectionId, {
      type: "send-sdp-rejected",
    });
    return { statusCode: 200, body: "invalid request" };
  }

  return {
    statusCode: 200,
    body: "send sdp success",
  };
};
