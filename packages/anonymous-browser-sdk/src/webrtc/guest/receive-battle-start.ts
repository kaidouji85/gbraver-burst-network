import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import { BattleStart, BattleStartSchema } from "../host/host-message";

/**
 * ホストから「BattleStart」メッセージを待ち受ける
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.signal Promise強制終了用シグナル
 * @returns BattleStartメッセージの内容
 */
export const receiveBattleStart = (
  options: {
    dataChannel: RTCDataChannel;
  } & Partial<SignalContainer>,
): Promise<BattleStart> => {
  const { dataChannel, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<BattleStart>((resolve, reject) => {
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
      const parsedBattleStart = BattleStartSchema.safeParse(data);
      if (parsedBattleStart.success) {
        resolve(parsedBattleStart.data);
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
