// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {extractUser} from './lambda/extract-user';
import {createGbraverBurstConnections} from "./dynamo-db/dao-creator";
import {SERVICE} from "./sls/service";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';

const dynamoDB = createDynamoDBClient(AWS_REGION);
const connections = createGbraverBurstConnections(dynamoDB, SERVICE, STAGE)

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