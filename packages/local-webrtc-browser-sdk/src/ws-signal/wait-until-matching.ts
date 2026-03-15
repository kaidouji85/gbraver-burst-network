import { Signal } from "../webrtc/signal";

/**
 * ホストがマッチングするまで待機する
 * @param websocket WebSocketコネクション
 * @returns シグナル情報
 */
export const waitUntilMatching = (websocket: WebSocket): Promise<Signal> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<Signal>((resolve) => {
    handler = (event) => {};
    websocket.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
