import { SignalContainer } from "../abort-controller/signal-container";
import { parseJSON } from "../json/parse";
import { DeleteSignalingChannelAcceptedSchema } from "./response/delete-signaling-channel-accepted";
import { DeleteSignalingChannelRejectedSchema } from "./response/delete-signaling-channel-rejected";
import { sendToWSSignal } from "./send-to-ws-signal";

/**
 * シグナリングチャネルを削除する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.signalingID 削除するシグナリングチャネルのID
 * @param options.signal Promise強制終了用シグナル
 * @return シグナリングチャネルの削除に成功したらtrue、失敗したらfalse
 */
export const deleteSignalingChannel = (
  options: {
    websocket: WebSocket;
    signalingID: string;
  } & Partial<SignalContainer>,
): Promise<boolean> => {
  const { websocket, signalingID, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<boolean>((resolve, reject) => {
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

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
