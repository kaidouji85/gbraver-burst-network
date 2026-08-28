import { parseJSON } from "../../json/parse";
import { BattleStart, BattleStartSchema } from "../host/host-message";

/**
 * ホストから「BattleStart」メッセージを待ち受ける
 * @param dataChannel データチャネル
 * @returns BattleStartメッセージの内容
 */
export const receiveBattleStart = (
  dataChannel: RTCDataChannel,
): Promise<BattleStart> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<BattleStart>((resolve) => {
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
  });
};
