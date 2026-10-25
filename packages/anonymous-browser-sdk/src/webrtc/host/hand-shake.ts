import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import { PongSchema } from "../guest/guest-message";
import { sendHostMessage } from "./host-message";

export const handShake = (
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
      const parsedSendCommand = PongSchema.safeParse(data);
      if (parsedSendCommand.success) {
        resolve(parsedSendCommand.data);
        return;
      }
    };
    dataChannel.addEventListener("message", handler);

    sendHostMessage(dataChannel, { type: "ping" });
  }).finally(() => {
    if (handler) {
      dataChannel.removeEventListener("message", handler);
    }

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
