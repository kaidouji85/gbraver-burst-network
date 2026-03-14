/**
 * 接続完了したWebSocketを返す
 * @param url 接続先のWebSocketサーバーのURL
 * @returns WebSocket
 */
export function connectWebSocket(url: string): Promise<WebSocket> {
  let handler: (() => void) | null = null;
  let errorHandler: ((event: Event) => void) | null = null;
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
