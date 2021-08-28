// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/websocket-api-event';
import {parseEnterCasualMatch} from "./lambda/enter-casual-match";
import {CasualMatchEntries} from "./dynamo-db/casual-match-entries";
import {parseJSON} from "./json/parse";

const AWS_REGION = process.env.AWS_REGION ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const CASUAL_MATCH_ENTRIES = process.env.CASUAL_MATCH_ENTRIES ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);
const casualMatchEntries = new CasualMatchEntries(dynamoDB, CASUAL_MATCH_ENTRIES);


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
    connections.put(updatedConnection)
  ]);
  return {statusCode: 200, body: 'enter casual match success'};
}