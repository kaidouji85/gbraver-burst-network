// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/websocket-api-event';

const AWS_REGION = process.env.AWS_REGION ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = new GbraverBurstConnections(dynamoDB, GBRAVER_BURST_CONNECTIONS);

/**
 * Websocket API $connect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function connect(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const user = extractUser(event.requestContext.authorizer);
  const state = {type: 'None'};
  const connection = {connectionId: event.requestContext.connectionId, userID: user.userID, state};
  await connections.put(connection);
  return {statusCode: 200, body: 'connected.'};
}