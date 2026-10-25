import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import {
  RequestSelectedPlayer,
  RequestSelectedPlayerSchema,
} from "../host/host-message";

/**
 * ホストから「RequestSelectedPlayer」メッセージを待ち受ける
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.signal Promise強制終了用シグナル
 * @returns フローID
 */
export const receiveRequestSelectedPlayer = (
  options: {
    dataChannel: RTCDataChannel;
  } & Partial<SignalContainer>,
): Promise<RequestSelectedPlayer> => {
  const { dataChannel, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<RequestSelectedPlayer>((resolve, reject) => {
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
      const parsedRequestSelectedPlayer =
        RequestSelectedPlayerSchema.safeParse(data);
      if (parsedRequestSelectedPlayer.success) {
        resolve(parsedRequestSelectedPlayer.data);
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
