// @flow

import {ApiGatewayManagementApi} from 'aws-sdk';

/**
 * APIゲートウェイ管理オブジェクトを生成する
 *
 * @param endpoint APIゲートウェイのエンドポイント
 * @return APIゲートウェイ管理オブジェクト
 */
export function createAPIGatewayManagement(endpoint: string): typeof ApiGatewayManagementApi {
  return new ApiGatewayManagementApi({apiVersion: '2018-11-29', endpoint});
}