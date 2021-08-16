// @flow

import type {HandlerResponse} from './lambda/handler-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {GbraverBurstConnections} from "./dynamo-db/gbraver-burst-connections";
import {createAPIGatewayManagement} from "./api-gateway/management";
import {apiGatewayEndpoint} from "./api-gateway/endpoint";
import type {HandlerEvent} from "./lambda/handler-event";

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
  try {
    const dao = new GbraverBurstConnections(dynamoClient, GBRAVER_BURST_CONNECTIONS);
    const connection = {connectionId: event.requestContext.connectionId}
    await dao.put(connection);
    return {statusCode: 200, body: 'connected.'};
  } catch(err) {
    console.error(err);
    return {statusCode: 500, body: 'connection error'};
  }
}

/**
 * $disconnect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function disconnect(event: HandlerEvent): Promise<HandlerResponse> {
  try {
    const dao = new GbraverBurstConnections(dynamoClient, GBRAVER_BURST_CONNECTIONS);
    const connectionId = event.requestContext.connectionId;
    await dao.delete(connectionId);
    return {statusCode: 200, body: 'disconnected'};
  } catch(err) {
    console.error(err);
    return {statusCode: 500, body: 'disconnect error'};
  }
}

/**
 * ping エントリポイント
 * 
 * @param event イベント
 * @return レスポンス
 */
export async function defaultHandler(event: HandlerEvent): Promise<HandlerResponse> {
  try {
    const data = {'action': 'ping', 'message': 'welcome to gbraver burst serverless'};
    const endpoint = apiGatewayEndpoint(event);
    const apiGateway = createAPIGatewayManagement(endpoint);
    await apiGateway
      .postToConnection({ConnectionId: event.requestContext.connectionId, Data: data})
      .promise();
    return {statusCode: 200, body: 'ping success'};
  } catch(err) {
    console.error(err);
    return {statusCode: 500, body: 'ping error'};
  }
}