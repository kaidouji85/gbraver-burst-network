import { SignalContainer } from "../abort-controller/signal-container";

/**
 * WebRTCコネクションが接続されるまで待機する
 * @param connection WebRTCコネクション
 * @param options オプション
 * @param options.signal Promise強制終了用シグナル
 * @returns 接続されたら発火するPromise
 */
export const waitUntilConnected = (
  connection: RTCPeerConnection,
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

    if (connection.connectionState === "connected") {
      resolve();
      return;
    }

    handler = () => {
      if (connection.connectionState === "connected") {
        resolve();
      }
    };
    connection.addEventListener("connectionstatechange", handler);
  }).finally(() => {
    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }

    if (handler) {
      connection.removeEventListener("connectionstatechange", handler);
    }
  });
};
