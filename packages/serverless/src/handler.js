// @flow

import type {HandlerResponse} from './lambda/handler-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import {createAPIGatewayFromRequestContext } from "./api-gateway/management";
import type {HandlerEvent} from "./lambda/handler-event";
import {extractUser} from './lambda/handler-event';
import {parseEnterCasualMatchBody} from "./lambda/enter-casual-match";
import {CasualMatchEntries} from "./dynamo-db/casual-match-entries";

const AWS_REGION = process.env.AWS_REGION ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';
const dynamoDB = createDynamoDBClient(AWS_REGION);

/**
 * $connect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function connect(event: HandlerEvent): Promise<HandlerResponse> {
  const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
  const user = extractUser(event.requestContext.authorizer);
  const connection = {connectionId: event.requestContext.connectionId, user};
  await connections.put(connection);
  return {statusCode: 200, body: 'connected.'};
}

/**
 * $disconnect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function disconnect(event: HandlerEvent): Promise<HandlerResponse> {
  const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
  const connectionId = event.requestContext.connectionId;
  await connections.delete(connectionId);
  return {statusCode: 200, body: 'disconnected'};
}

/**
 * ping エントリポイント
 * 
 * @param event イベント
 * @return レスポンス
 */
export async function ping(event: HandlerEvent): Promise<HandlerResponse> {
  const data = {'action': 'ping', 'message': 'welcome to gbraver burst serverless'};
  const respData = JSON.stringify(data);
  const apiGateway = createAPIGatewayFromRequestContext(event.requestContext);
  await apiGateway
    .postToConnection({ConnectionId: event.requestContext.connectionId, Data: respData})
    .promise();
  return {statusCode: 200, body: 'ping success'};
}

/**
 * enterCasualMatch エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function enterCasualMatch(event: HandlerEvent): Promise<HandlerResponse> {
  const body = event.body ?? '';
  const data = parseEnterCasualMatchBody(body);
  if (!data) {
    return {statusCode: 400, body: 'invalid request body'}
  }

  const user = extractUser(event.requestContext.authorizer);
  const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);
  const entry = {userID: user.userID, armdozerId: data.armdozerId, pilotId: data.pilotId};
  await casualMatchEntries.put(entry);
  return {statusCode: 200, body: 'enter casual match success'};
}