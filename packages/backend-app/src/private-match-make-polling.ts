import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createDynamoDBClient } from "./dynamo-db/client";
import { createPrivateMatchRooms } from "./dynamo-db/create-private-match-rooms";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parsePrivateMatchMakePolling } from "./request/private-match-make-polling";
import type { CouldNotPrivateMatchMaking, Error } from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const dynamoDB = createDynamoDBClient(AWS_REGION);
const privateMatchRooms = createPrivateMatchRooms(dynamoDB, SERVICE, STAGE);

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);

const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body",
};
const cloudNotPrivateMatchMake: CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making",
};

/**
 * プライベートマッチメイクポーリング
 * @param event イベント
 * @return レスポンス
 */
export async function privateMatchMakePolling(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parsePrivateMatchMakePolling(body);
  if (!data) {
    await notifier.notifyToClient(
      event.requestContext.connectionId,
      invalidRequestBodyError
    );
    return {
      statusCode: 400,
      body: "invalid request body",
    };
  }

  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer
  );
  
  return {
    statusCode: 200,
    body: "end private match make polling",
  };
}
