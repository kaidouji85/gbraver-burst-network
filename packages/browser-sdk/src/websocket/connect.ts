import { Reject } from "../promise/promise";

/**
 * 接続完了したWebSocketを返す
 *
 * @param url 接続先のWebSocket
 * @returns WebSocket
 */
export function connect(url: string): Promise<WebSocket> {
  let handler: (() => void) | null = null;
  let errorHandler: Reject | null = null;
  const websocket = new WebSocket(url);
  return new Promise<WebSocket>((resolve, reject) => {
    handler = () => {
      resolve(websocket);
    };

    errorHandler = reject;
    websocket.addEventListener("open", handler);
    websocket.addEventListener("error", errorHandler);
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("open", handler);
    }
    if (errorHandler) {
      websocket.removeEventListener("error", errorHandler);
    }
  });
}
