import { createAPIGatewayEndpoint } from "./api-gateway/endpoint";
import { createApiGatewayManagementApi } from "./api-gateway/management";
import { Notifier } from "./api-gateway/notifier";
import { createDynamoDBClient } from "./dynamo-db/client";
import { createCasualMatchEntries } from "./dynamo-db/create-casual-match-entries";
import { createConnections } from "./dynamo-db/create-connections";
import { parseJSON } from "./json/parse";
import { extractUserFromWebSocketAuthorizer } from "./lambda/extract-user";
import type { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import type { WebsocketAPIResponse } from "./lambda/websocket-api-response";
import { parseEnterCasualMatch } from "./request/enter-casual-match";
import type { EnteredCasualMatch, Error } from "./response/websocket-response";
const AWS_REGION = process.env.AWS_REGION ?? "";
const SERVICE = process.env.SERVICE ?? "";
const STAGE = process.env.STAGE ?? "";
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? "";
const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createConnections(dynamoDB, SERVICE, STAGE);
const casualMatchEntries = createCasualMatchEntries(dynamoDB, SERVICE, STAGE);
const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const invalidRequestBodyError: Error = {
  action: "error",
  error: "invalid request body"
};
const enteredCasualMatch: EnteredCasualMatch = {
  action: "entered-casual-match"
};

/**
 * Websocket API enter-casual-match エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function enterCasualMatch(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const body = parseJSON(event.body);
  const data = parseEnterCasualMatch(body);

  if (!data) {
    await notifier.notifyToClient(event.requestContext.connectionId, invalidRequestBodyError);
    return {
      statusCode: 400,
      body: "invalid request body"
    };
  }

  const user = extractUserFromWebSocketAuthorizer(event.requestContext.authorizer);
  const entry = {
    userID: user.userID,
    armdozerId: data.armdozerId,
    pilotId: data.pilotId,
    connectionId: event.requestContext.connectionId
  };
  const state = {
    type: "CasualMatchMaking"
  };
  const updatedConnection = {
    connectionId: event.requestContext.connectionId,
    userID: user.userID,
    state
  };
  await Promise.all([casualMatchEntries.put(entry), connections.put(updatedConnection), notifier.notifyToClient(event.requestContext.connectionId, enteredCasualMatch)]);
  return {
    statusCode: 200,
    body: "enter casual match success"
  };
}