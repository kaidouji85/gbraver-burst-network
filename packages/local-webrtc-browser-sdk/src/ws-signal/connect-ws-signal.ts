/**
 * WebSocketシグナルサーバーに接続する
 * @param url 接続先のWebSocketシグナルサーバーのURL
 * @returns 接続に成功したWebSocket、接続に失敗した場合はPromiseがrejectされる
 */
export function connectWSSignal(url: string): Promise<WebSocket> {
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
