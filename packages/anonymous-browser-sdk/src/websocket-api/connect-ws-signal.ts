import { SignalContainer } from "../abort-controller/signal-container";

/**
 * WebSocketシグナルサーバーに接続する
 * @param url 接続先のWebSocketシグナルサーバーのURL
 * @param token 認証トークン
 * @param options オプション
 * @returns 接続に成功したWebSocket、接続に失敗した場合はPromiseがrejectされる
 */
export function connectWSSignal(
  url: string,
  token: string,
  options?: Partial<SignalContainer>,
): Promise<WebSocket> {
  const signal = options?.signal;
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  let onAbort: (() => void) | null = null;
  let handler: (() => void) | null = null;
  let errorHandler: ((event: Event) => void) | null = null;
  const websocket = new WebSocket(`${url}?token=${token}`);
  return new Promise<WebSocket>((resolve, reject) => {
    onAbort = () => {
      websocket.close();
      reject(signal?.reason);
    };

    handler = () => {
      resolve(websocket);
    };

    errorHandler = reject;

    signal?.addEventListener("abort", onAbort);
    websocket.addEventListener("open", handler);
    websocket.addEventListener("error", errorHandler);
  }).finally(() => {
    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }

    if (handler) {
      websocket.removeEventListener("open", handler);
    }

    if (errorHandler) {
      websocket.removeEventListener("error", errorHandler);
    }
  });
}
