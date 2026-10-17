import { SignalContainer } from "../abort-controller/signal-container";

/**
 * 指定された時間待機する
 * @param ms ミリ秒単位で指定する待ち時間
 * @param options オプション
 * @returns 待ち時間が終了したら発火するPromise
 */
export function wait(
  ms: number,
  options?: Partial<SignalContainer>,
): Promise<void> {
  const signal = options?.signal;
  let onAbort: (() => void) | null = null;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    onAbort = () => reject(signal?.reason);
    signal?.addEventListener("abort", onAbort);

    setTimeout(() => {
      resolve();
    }, ms);
  }).finally(() => {
    if (signal && onAbort) {
      signal.removeEventListener("abort", onAbort);
    }
  });
}
