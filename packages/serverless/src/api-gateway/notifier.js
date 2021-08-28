// @flow

import {ApiGatewayManagementApi} from "aws-sdk";

/**
 * クライアントにメッセージ送信する
 *
 * @param connectionID コネクションID
 * @param data 送信するデータ
 * @return メッセージ送信が完了したら発火するPromise
 */
export type Notifier = (connectionID: string, data: any) => Promise<void>;

/**
 * Notifierを生成する
 *
 * @param api APIGateway管理オブジェクト
 * @return 生成結果
 */
export const createNotifier = (api: typeof ApiGatewayManagementApi): Notifier => (connectionID: string, data: any): Promise<void> => {
  const sendData = JSON.stringify(data);
  return api.postToConnection({ConnectionId: connectionID, Data: sendData}).promise();
}