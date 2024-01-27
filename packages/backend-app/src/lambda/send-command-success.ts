import { WebsocketAPIResponse } from "./websocket-api-response";

/** WebSocketAPI レスポンス コマンド送信成功 */
export const sendCommandSuccess: WebsocketAPIResponse = {
  statusCode: 200,
  body: "send command success",
};
