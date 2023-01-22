import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";

/**
 * Websocket API createPrivateMatchRoom エントリポイント
 * @param event イベント
 * @return レスポンス
 */
export async function createPrivateMatchRoom(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  return {
    statusCode: 200,
    body: "create private match room",
  };
}
