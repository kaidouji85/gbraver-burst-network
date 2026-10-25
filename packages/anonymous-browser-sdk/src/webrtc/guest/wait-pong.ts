import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import { PingSchema } from "../host/host-message";

/**
 * ホストからのpingを待つ
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.signal アボートシグナル
 * @returns 疎通確認が完了したら発火するPromise
 */
export const waitPong = (
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
