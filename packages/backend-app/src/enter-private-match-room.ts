import { WebsocketAPIEvent } from "./lambda/websocket-api-event";
import { WebsocketAPIResponse } from "./lambda/websocket-api-response";

/**
 * プライベートマッチルームエントリー
 * @param event イベント
 * @returns レスポンス
 */
export async function enterPrivateMatchRoom(
  event: WebsocketAPIEvent
): Promise<WebsocketAPIResponse> {
  return {
    statusCode: 200,
    body: "enter private match room",
  };
}
