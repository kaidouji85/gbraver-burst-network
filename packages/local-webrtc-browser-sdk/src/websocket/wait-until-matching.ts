import { parseJSON } from "../json/parse";
import { Signal } from "../webrtc/signal";
import { MatchingSchema } from "./response/matching";

/**
 * ホストがマッチングするまで待機する
 * @param websocket WebSocketコネクション
 * @returns シグナル情報
 */
export const waitUntilMatching = (websocket: WebSocket): Promise<Signal> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<Signal>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);
      const parsedMatching = MatchingSchema.safeParse(parsedData);
      if (parsedMatching.success) {
        const matching = parsedMatching.data;
        const { sdp, iceCandidates } = matching;
        resolve({ sdp, iceCandidates });
      }
    };
    websocket.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
