// @flow

import {ApiGatewayManagementApi} from 'aws-sdk';
import type {WebsocketAPIRequestContext} from '../lambda/websocket-api-event';

/**
 * APIゲートウェイ管理オブジェクトを生成するヘルパー関数
 *
 * @param endpoint APIゲートウェイのエンドポイント
 * @return APIゲートウェイ管理オブジェクト
 */
export function createAPIGateway(endpoint: string): typeof ApiGatewayManagementApi {
  return new ApiGatewayManagementApi({apiVersion: '2018-11-29', endpoint});
}

/**
 * リクエストコンテキストからAPIゲートウェイのエンドポイントを生成する
 *
 * @param requestContext リクエストコンテキスト
 * @return APIゲートウェイのエンドポイント
 */
export function endpointFromRequestContext(requestContext: WebsocketAPIRequestContext): string {
  return `${requestContext.domainName}/${requestContext.stage}`;
}

/**
 * リクエストコンテキストからAPIゲートウェイマネジャーを生成するヘルパー関数
 * 
 * @param requestContext リクエストコンテキスト
 * @return APIゲートウェイ管理オブジェクト
 */
export function createAPIGatewayFromRequestContext(requestContext: WebsocketAPIRequestContext): typeof ApiGatewayManagementApi {
  const endpoint = endpointFromRequestContext(requestContext);
  return createAPIGateway(endpoint);
}