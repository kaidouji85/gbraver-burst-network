// @flow

import {ApiGatewayManagementApi} from "aws-sdk";

/** メッセージ通知 */
export class Notifier {
  _api: typeof ApiGatewayManagementApi;

  /**
   * コンストラクタ
   * 
   * @param api APIゲートウェイ管理オブジェクト
   */
  constructor(api: typeof ApiGatewayManagementApi) {
    this._api = api;
  }

  /**
   * クライアントにメッセージ送信する
   *
   * @param connectionID コネクションID
   * @param data 送信するデータ
   * @return メッセージ送信が完了したら発火するPromise
   */
  notifyToClient(connectionID: string, data: any): Promise<void> {
    const sendData = JSON.stringify(data);
    return this._api.postToConnection({ConnectionId: connectionID, Data: sendData}).promise();
  }
}