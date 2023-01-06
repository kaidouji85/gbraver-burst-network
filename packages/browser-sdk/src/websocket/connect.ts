/**
 * 接続完了したWebSocketを返す
 *
 * @param url 接続先のWebSocket
 * @return WebSocket
 */
export function connect(url: string): Promise<WebSocket> {
  let handler: (() => void) | null = null;
  let errorHandler: ((error: any) => void) | null = null;
  const websocket = new WebSocket(url);
  return new Promise<WebSocket>((resolve, reject) => {
    handler = () => {
      resolve(websocket);
    };

    errorHandler = reject;
    websocket.addEventListener("open", handler);
    websocket.addEventListener("error", errorHandler);
  }).finally(() => {
    handler && websocket.removeEventListener("open", handler);
    errorHandler && websocket.removeEventListener("error", errorHandler);
  });
}