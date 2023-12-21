import { WebsocketAPIResponse } from "./websocket-api-response";

/** プライベートマッチメイク正常終了 */
export const endPrivateMatchMakePolling: WebsocketAPIResponse = {
  statusCode: 200,
  body: "end private match make polling",
};