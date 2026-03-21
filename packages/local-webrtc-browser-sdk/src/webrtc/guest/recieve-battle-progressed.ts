import { parseJSON } from "../../json/parse";
import { BattleProgressed, BattleProgressedSchema } from "../host/host-message";

/**
 * ホストから「BattleProgressed」メッセージを待ち受ける
 * @param dataChannel データチャネル
 * @returns BattleProgressedメッセージの内容
 */
export const receiveBattleProgressed = (
  dataChannel: RTCDataChannel,
): Promise<BattleProgressed> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<BattleProgressed>((resolve) => {
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
  });
};
