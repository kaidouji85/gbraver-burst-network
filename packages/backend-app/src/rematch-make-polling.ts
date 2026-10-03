import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";

/**
 * 再戦マッチメークポーリング
 * @param event イベント
 * @returns レスポンス
 */
export const rematchMakePolling = async (
  event: WebsocketAPIEvent,
): Promise<WebsocketAPIResponse> => {
  return {
    statusCode: 200,
    body: "end rematch make polling",
  };
};
