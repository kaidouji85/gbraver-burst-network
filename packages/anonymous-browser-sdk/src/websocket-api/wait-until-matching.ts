import { SignalContainer } from "../abort-controller/signal-container";
import { parseJSON } from "../json/parse";
import { MatchingSchema } from "./response/matching";

/**
 * ホストがマッチングするまで待機する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.signal Promise強制終了用シグナル
 * @returns シグナリングID
 */
export const waitUntilMatching = (
  options: { websocket: WebSocket } & Partial<SignalContainer>,
): Promise<string> => {
  const { websocket, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<string>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    handler = (event) => {
      const parsedData = parseJSON(event.data);
      const parsedMatching = MatchingSchema.safeParse(parsedData);
      if (parsedMatching.success) {
        const { signalingID } = parsedMatching.data;
        resolve(signalingID);
      }
    };
    websocket.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
