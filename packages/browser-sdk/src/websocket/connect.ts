import { SignalContainer } from "../abort-controller/signal-container";
import { Reject } from "../promise/promise";

/**
 * 接続完了したWebSocketを返す
 * @param url 接続先のWebSocket
 * @param options オプション
 * @returns WebSocket
 */
export function connect(
  url: string,
  options?: Partial<SignalContainer>,
): Promise<WebSocket> {
  const signal = options?.signal;
  let handler: (() => void) | null = null;
  let errorHandler: Reject | null = null;
  let onAbort: (() => void) | null = null;
  const websocket = new WebSocket(url);
  return new Promise<WebSocket>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

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
    if (handler) {
      websocket.removeEventListener("open", handler);
    }

    if (errorHandler) {
      websocket.removeEventListener("error", errorHandler);
    }

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
}
