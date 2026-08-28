import { parseJSON } from "../json/parse";
import { DeleteSignalingChannelAcceptedSchema } from "./response/delete-signaling-channel-accepted";
import { DeleteSignalingChannelRejectedSchema } from "./response/delete-signaling-channel-rejected";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * シグナリングチャネルを削除する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.signalingID 削除するシグナリングチャネルのID
 * @return シグナリングチャネルの削除に成功したらtrue、失敗したらfalse
 */
export const deleteSignalingChannel = (options: {
  websocket: WebSocket;
  signalingID: string;
}): Promise<boolean> => {
  const { websocket, signalingID } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<boolean>((resolve) => {
    handler = (event) => {
      const parsedData = parseJSON(event.data);
      const deleteSignalingChannelAccepted =
        DeleteSignalingChannelAcceptedSchema.safeParse(parsedData);
      if (deleteSignalingChannelAccepted.success) {
        resolve(true);
        return;
      }

      const deleteSignalingChannelRejected =
        DeleteSignalingChannelRejectedSchema.safeParse(parsedData);
      if (deleteSignalingChannelRejected.success) {
        resolve(false);
        return;
      }
    };
    websocket.addEventListener("message", handler);
    sendToWSSignal(websocket, {
      action: "delete-signaling-channel",
      signalingID,
    });
  }).finally(() => {
    if (handler) {
      websocket.removeEventListener("message", handler);
    }
  });
};
