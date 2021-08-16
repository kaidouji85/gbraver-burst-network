// @flow

import type {HandlerResponse} from './lambda/handler-response';
import {createDynamoDBClient} from "./dynamo-db/client";
import {SLSChatConnections} from "./dynamo-db/sls-chat-cpnnections";
import {createAPIGatewayManagement} from "./api-gateway/management";
import {apiGatewayEndpoint} from "./api-gateway/endpoint";
import type {HandlerEvent} from "./lambda/handler-event";

const AWS_REGION = process.env.AWS_REGION ?? '';
const SLS_CHAT_CONNECTIONS = process.env.SLS_CHAT_CONNECTIONS ?? '';
const dynamoClient = createDynamoDBClient(AWS_REGION);

/**
 * $connect エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function connect(event: HandlerEvent): Promise<HandlerResponse> {
  try {
    const dao = new SLSChatConnections(dynamoClient, SLS_CHAT_CONNECTIONS);
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
    const dao = new SLSChatConnections(dynamoClient, SLS_CHAT_CONNECTIONS);
    const connectionId = event.requestContext.connectionId;
    await dao.delete(connectionId);
    return {statusCode: 200, body: 'disconnected'};
  } catch(err) {
    console.error(err);
    return {statusCode: 500, body: 'disconnect error'};
  }
}

/**
 * sendMessage エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function sendMessage(event: HandlerEvent): Promise<HandlerResponse> {
  try {
    const body = event?.body ?? '';
    const data = JSON.parse(body)?.data;
    if ((typeof data) !== 'string') {
      return {statusCode: 400, body: 'invalid data'};
    }

    const dao = new SLSChatConnections(dynamoClient, SLS_CHAT_CONNECTIONS);
    const endpoint = apiGatewayEndpoint(event);
    const apiGateway = createAPIGatewayManagement(endpoint);
    const connections = await dao.all();
    await Promise.all(connections.map(v => apiGateway.postToConnection({
      ConnectionId: v.connectionId,
      Data: data
    }).promise()));
    return {statusCode: 200, body: 'message sent'};
  } catch(err) {
    console.error(err);
    return {statusCode: 500, body: 'send message error'};
  }
}