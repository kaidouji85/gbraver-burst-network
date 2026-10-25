import { SignalContainer } from "../abort-controller/signal-container";
import { parseJSON } from "../json/parse";
import { ReceiveRemoteSDPSchema } from "./response/receive-remote-sdp";
import { SendSDPRejectedSchema } from "./response/send-sdp-rejected";

/**
 * 相手からSDPを受信するまで待機する
 * @param options オプション
 * @param options.websocket WebSocketコネクション
 * @param options.signal Promise強制終了用シグナル
 * @returns 受信したSDP
 */
export const waitUntilSDPReceive = (
  options: { websocket: WebSocket } & Partial<SignalContainer>,
): Promise<RTCSessionDescriptionInit> => {
  const { websocket, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
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
      const remoteSDP = ReceiveRemoteSDPSchema.safeParse(parsedData);
      if (remoteSDP.success) {
        resolve(remoteSDP.data.sdp);
        return;
      }

      const sendSDPRejected = SendSDPRejectedSchema.safeParse(parsedData);
      if (sendSDPRejected.success) {
        reject(new Error("send sdp rejected"));
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
