import { parseJSON } from "../json/parse";
import type { Resolve } from "../promise/promise";
import type { Pong } from "../response/pong";
import { parsePong } from "../response/pong";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * API サーバへの疎通確認
 *
 * @param websocket websocketクライアント
 * @return APIサーバからの返答内容
 */
export function ping(websocket: WebSocket): Promise<Pong> {
  sendToAPIServer(websocket, {
    action: "ping",
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<Pong>): void => {
      const data = parseJSON(e.data);
      const response = parsePong(data);
      response && resolve(response);
    }
  );
}
