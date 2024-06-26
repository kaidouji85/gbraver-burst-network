import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { TextEncoder } from "util";

import type { WebsocketResponse } from "../response/websocket-response";

/** メッセージ通知 */
export class Notifier {
  _api: ApiGatewayManagementApi;

  /**
   * コンストラクタ
   *
   * @param api APIゲートウェイ管理オブジェクト
   */
  constructor(api: ApiGatewayManagementApi) {
    this._api = api;
  }

  /**
   * クライアントにメッセージ送信する
   *
   * @param connectionID コネクションID
   * @param data 送信するデータ
   * @returns メッセージ送信が完了したら発火するPromise
   */
  async notifyToClient(
    connectionID: string,
    data: WebsocketResponse,
  ): Promise<void> {
    const sendData = new TextEncoder().encode(JSON.stringify(data));
    await this._api.postToConnection({
      ConnectionId: connectionID,
      Data: sendData,
    });
  }
}
