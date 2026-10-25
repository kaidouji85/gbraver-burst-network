import { SignalContainer } from "../../abort-controller/signal-container";

/**
 * ゲスト側でデータチャネルが開通するのを待つ
 * @param connection ホスト側のWebRTCコネクション
 * @param options オプション
 * @param options.signal Promise強制終了用シグナル
 * @returns 開通したデータチャネル
 */
export const waitUntilDataChannel = (
  connection: RTCPeerConnection,
  options?: Partial<SignalContainer>,
): Promise<RTCDataChannel> => {
  const signal = options?.signal;
  let onAbort: (() => void) | null = null;
  return new Promise<RTCDataChannel>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => {
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort);

    connection.addEventListener(
      "datachannel",
      (event) => {
        resolve(event.channel);
      },
      { once: true },
    );
  }).finally(() => {
    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
