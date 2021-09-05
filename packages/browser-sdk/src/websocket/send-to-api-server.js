// @flow

import type {APIServerRequest} from "../request/request";

/**
 * APIサーバにメッセージ送信をする
 *
 * @param websocket WebSocketクライアント
 * @param data 送信内容
 */
export function sendToAPIServer(websocket: WebSocket, data: APIServerRequest): void {
  websocket.send(JSON.stringify(data));
}