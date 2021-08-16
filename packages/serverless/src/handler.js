// @flow

import type {HandlerResponse} from './lambda/handler-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import {createAPIGatewayManagement} from "./api-gateway/management";
import {apiGatewayEndpoint} from "./api-gateway/endpoint";
import type {HandlerEvent} from "./lambda/handler-event";
import {extractUser} from './lambda/handler-event';

const AWS_REGION = process.env.AWS_REGION ?? '';
const GBRAVER_BURST_CONNECTIONS = process.env.GBRAVER_BURST_CONNECTIONS ?? '';
const dynamoClient = createDynamoDBClient(AWS_REGION);

/**
 * $connect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function connect(event: HandlerEvent): Promise<HandlerResponse> {
  const dao = new GbraverBurstConnections(dynamoClient, GBRAVER_BURST_CONNECTIONS);
  const user = extractUser(event.requestContext.authorizer);
  const connection = {connectionId: event.requestContext.connectionId, user};
  await dao.put(connection);
  return {statusCode: 200, body: 'connected.'};
}

/**
 * $disconnect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function disconnect(event: HandlerEvent): Promise<HandlerResponse> {
  const dao = new GbraverBurstConnections(dynamoClient, GBRAVER_BURST_CONNECTIONS);
  const connectionId = event.requestContext.connectionId;
  await dao.delete(connectionId);
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
  const endpoint = apiGatewayEndpoint(event);
  const apiGateway = createAPIGatewayManagement(endpoint);
  await apiGateway
    .postToConnection({ConnectionId: event.requestContext.connectionId, Data: respData})
    .promise();
  return {statusCode: 200, body: 'ping success'};
}