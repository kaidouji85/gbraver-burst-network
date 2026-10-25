import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import { BattleProgressed, BattleProgressedSchema } from "../host/host-message";

/**
 * ホストから「BattleProgressed」メッセージを待ち受ける
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.signal Promise強制終了用シグナル
 * @returns BattleProgressedメッセージの内容
 */
export const receiveBattleProgressed = (
  options: {
    dataChannel: RTCDataChannel;
  } & Partial<SignalContainer>,
): Promise<BattleProgressed> => {
  const { dataChannel, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<BattleProgressed>((resolve, reject) => {
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
      const parsedBattleProgressed = BattleProgressedSchema.safeParse(data);
      if (parsedBattleProgressed.success) {
        resolve(parsedBattleProgressed.data);
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
