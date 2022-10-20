// @flow

import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { createDynamoDBClient } from "./dynamo-db/client";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import { createConnections } from "./dynamo-db/dao-creator";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);

/**
 * Websocket API $connect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function connect(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer
  );
  const state = { type: "None" };
  const connection = {
    connectionId: event.requestContext.connectionId,
    userID: user.userID,
    state,
  };
  await connections.put(connection);
  return { statusCode: 200, body: "connected." };
}
