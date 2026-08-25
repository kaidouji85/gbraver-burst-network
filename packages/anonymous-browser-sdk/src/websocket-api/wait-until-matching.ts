import { parseJSON } from "../json/parse";
import { MatchingSchema } from "./response/matching";

/**
 * ホストがマッチングするまで待機する
 * @param websocket WebSocketコネクション
 * @returns シグナリングID
 */
export const waitUntilMatching = (websocket: WebSocket): Promise<string> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<string>((resolve) => {
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
  });
};
