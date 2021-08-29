// @flow

import type {WebsocketAPIResponse} from './lambda/websocket-api-response';
import {createApiGatewayManagementApi} from "./api-gateway/management";
import type {WebsocketAPIEvent} from "./lambda/websocket-api-event";
import {createAPIGatewayEndpoint} from "./api-gateway/endpoint";
import {Notifier} from "./api-gateway/notifier";

const AWS_REGION = process.env.AWS_REGION ?? '';
const STAGE = process.env.STAGE ?? '';
const WEBSOCKET_API_ID = process.env.WEBSOCKET_API_ID ?? '';

const apiGatewayEndpoint = createAPIGatewayEndpoint(WEBSOCKET_API_ID, AWS_REGION, STAGE);
const apiGateway = createApiGatewayManagementApi(apiGatewayEndpoint);
const notifier = new Notifier(apiGateway);

/**
 * Websocket API ping エントリポイント
 *
 * @param event イベント
 * @return レスポンス
 */
export async function ping(event: WebsocketAPIEvent): Promise<WebsocketAPIResponse> {
  const data = {'action': 'ping', 'message': 'welcome to gbraver burst serverless'};
  await notifier.notifyToClient(event.requestContext.connectionId, data);
  return {statusCode: 200, body: 'ping success'};
}