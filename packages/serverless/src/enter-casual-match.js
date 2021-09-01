// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/extract-user';
import {parseEnterCasualMatch} from "./request/enter-casual-match";
import {CasualMatchEntries} from "./dynamo-db/casual-match-entries";
import {parseJSON} from "./json/parse";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {createApiGatewayManagementApi} from "./api-gateway/management";
import {Notifier} from "./api-gateway/notifier";
import type {EnteredCasualMatch, Error} from "./response/websocket-response";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);
const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);
const invalidRequestBodyError: Error = {action: 'error', error: 'invalid request body'};
const enteredCasualMatch: EnteredCasualMatch = {action: 'entered-casual-match'};

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
    await notifier.notifyToClient(event.requestContext.connectionId, invalidRequestBodyError)
    return {statusCode: 400, body: 'invalid request body'}
  }

  const user = extractUser(event.requestContext.authorizer);
  const entry = {userID: user.userID, armdozerId: data.armdozerId, pilotId: data.pilotId,
    connectionId: event.requestContext.connectionId};
  const state = {type: 'CasualMatchMaking'};
  const updatedConnection = {connectionId: event.requestContext.connectionId,
    userID: user.userID, state};
  await Promise.all([
    casualMatchEntries.put(entry),
    connections.put(updatedConnection),
    notifier.notifyToClient(event.requestContext.connectionId, enteredCasualMatch)
  ]);
  return {statusCode: 200, body: 'enter casual match success'};
}