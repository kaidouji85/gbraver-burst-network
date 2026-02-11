import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { createDynamoConnections } from "./dynamo-db/create-dynamo-connections";
import { createDynamoDBDocument } from "./dynamo-db/dynamo-db-document";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";

const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";

const apiGatewayEndpoint = createAPIGatewayEndpoint(
  WEBSOCKET_API_ID,
  AWS_REGION,
  STAGE,
);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);

const dynamoDB = createDynamoDBDocument(AWS_REGION);
const dynamoConnections = createDynamoConnections(dynamoDB, SERVICE, STAGE);

/**
 * Websocket API $connect エントリポイント
 *
 * @param event イベント
 * @returns レスポンス
 */
export async function connect(
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> {
  const user = extractUserFromWebSocketAuthorizer(
    event.requestContext.authorizer,
  );

  const currentConnectionId = event.requestContext.connectionId;
  const connections = await dynamoConnections.queryByUserID(user.userID);
  // GSIの結果整合性およびConnectionID再利用などで、
  // 既存コネクションテーブルに同一ユーザIDの別コネクションが存在した場合に備えて、
  // filterで現在のコネクションIDを除外している
  const oldConnectionIds = connections
    .map((c) => c.connectionId)
    .filter((id) => id !== currentConnectionId);
  const deletedOldConnectionResults = await Promise.allSettled(
    oldConnectionIds.map((oldConnectionId) =>
      apiGateway.deleteConnection({ ConnectionId: oldConnectionId }),
    ),
  );
  deletedOldConnectionResults
    .filter((result) => result.status === "rejected")
    .forEach((result) =>
      console.error("Failed to delete old connection:", result.reason),
    );

  await dynamoConnections.put({
    connectionId: currentConnectionId,
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
