import { SignalContainer } from "../abort-controller/signal-container";

/**
 * データチャンネルが開通するのを待つ
 * @param dataChannel データチャンネル
 * @param options オプション
 * @param options.signal Promise強制終了用シグナル
 * @returns データチャンネルが開通したら発火するPromise
 */
export const waitUntilDataChannelOpen = (
  dataChannel: RTCDataChannel,
  options?: Partial<SignalContainer>,
): Promise<void> => {
  const signal = options?.signal;
  let handler: (() => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    if (dataChannel.readyState === "open") {
      resolve();
      return;
    }

    handler = () => {
      if (dataChannel.readyState === "open") {
        resolve();
      }
    };

    dataChannel.addEventListener("open", handler);
  }).finally(() => {
    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }

    if (handler) {
      dataChannel.removeEventListener("open", handler);
    }
  });
};
