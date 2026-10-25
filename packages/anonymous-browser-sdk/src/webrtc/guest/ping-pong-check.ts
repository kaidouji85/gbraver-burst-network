import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import { sendGuestMessage } from "../guest/guest-message";
import { PingSchema } from "../host/host-message";

/**
 * ping -> pong による疎通確認を行う
 * ゲストなので ping を待って pong を送信する
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.signal アボートシグナル
 * @returns
 */
export const pingPongCheck = (
  options: { dataChannel: RTCDataChannel } & Partial<SignalContainer>,
) => {
  const { dataChannel, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    handler = (event) => {
      const data = parseJSON(event.data);
      const parsedPing = PingSchema.safeParse(data);
      if (parsedPing.success) {
        sendGuestMessage(dataChannel, { type: "pong" });
        resolve(parsedPing.data);
        return;
      }
    };
    dataChannel.addEventListener("message", handler);
  }).finally(() => {
    if (handler) {
      dataChannel.removeEventListener("message", handler);
    }

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
