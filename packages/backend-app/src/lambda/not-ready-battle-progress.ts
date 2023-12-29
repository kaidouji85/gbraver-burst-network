import { WebsocketAPIResponse } from "./websocket-api-response";

/** WebSocketAPI レスポンス コマンド入力が完了していない */
export const notReadyBattleProgress: WebsocketAPIResponse = {
  statusCode: 200,
  body: "not-ready-battle-progress",
};
