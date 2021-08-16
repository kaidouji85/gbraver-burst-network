// @flow

import {ApiGatewayManagementApi} from 'aws-sdk';
import type {HandlerRequestContext} from '../lambda/handler-event';

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
export function endpointFromRequestContext(requestContext: HandlerRequestContext): string {
  return `${requestContext.domainName}/${requestContext.stage}`;
}

/**
 * リクエストコンテキストからAPIゲートウェイマネジャーを生成するヘルパー関数
 * 
 * @param requestContext リクエストコンテキスト
 * @return APIゲートウェイ管理オブジェクト
 */
export function createAPIGatewayFromRequestContext(requestContext: HandlerRequestContext): typeof ApiGatewayManagementApi {
  const endpoint = endpointFromRequestContext(requestContext);
  return createAPIGateway(endpoint);
}