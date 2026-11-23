import { SignalContainer } from "../../abort-controller/signal-container";
import { parseJSON } from "../../json/parse";
import {
  BattleEnd,
  BattleEndSchema,
  BattleProgressed,
  BattleProgressedSchema,
} from "../host/host-message";

/**
 * ホストからのバトル更新メッセージを待ち受ける
 * @param options オプション
 * @param options.dataChannel データチャネル
 * @param options.signal Promise強制終了用シグナル
 * @returns バトル更新メッセージ
 */
export const receiveBattleUpdate = (
  options: {
    dataChannel: RTCDataChannel;
  } & Partial<SignalContainer>,
): Promise<BattleProgressed | BattleEnd> => {
  const { dataChannel, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<BattleProgressed | BattleEnd>((resolve, reject) => {
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

      const parsedBattleEnd = BattleEndSchema.safeParse(data);
      if (parsedBattleEnd.success) {
        resolve(parsedBattleEnd.data);
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
