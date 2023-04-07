import { createConnections } from "./dynamo-db/create-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";
const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const dynamoDB = createDynamoDBDocument(AWS_REGION);
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
  await connections.put({
    connectionId: event.requestContext.connectionId,
    userID: user.userID,
    state: {
      type: "None",
    },
  });
  return {
    statusCode: 200,
    body: "connected.",
  };
}
