import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { parseJSON } from "../../json/parse";
import { SendPlayerSchema } from "../guest/guest-message";
import { sendHostMessage } from "./host-message";

/** ホストが選択したプレイヤーの情報 */
type HostSelectedPlayer = {
  /** ホストが選択したアームドーザーのID */
  armdozerId: ArmdozerId;
  /** ホストが選択したパイロットのID */
  pilotId: PilotId;
};

/**
 * ホストに選択したプレイヤーを共有するようにリクエストする
 * @param dataChannel データチャンネル
 * @param flowID ゲームのフローID
 * @returns ホストが選択したプレイヤー情報
 */
export const requestSelectedPlayer = (
  dataChannel: RTCDataChannel,
  flowID: string,
): Promise<HostSelectedPlayer> => {
  let handler: ((event: MessageEvent) => void) | null = null;
  return new Promise<HostSelectedPlayer>((resolve) => {
    handler = (event) => {
      const data = parseJSON(event.data);
      const parsedSendPlayer = SendPlayerSchema.safeParse(data);
      if (parsedSendPlayer.success && parsedSendPlayer.data.flowID === flowID) {
        const { armdozerId, pilotId } = parsedSendPlayer.data;
        resolve({ armdozerId, pilotId });
      }
    };
    dataChannel.addEventListener("message", handler);
    sendHostMessage(dataChannel, {
      type: "request-selected-player",
      flowID,
    });
  }).finally(() => {
    if (handler) {
      dataChannel.removeEventListener("message", handler);
    }
  });
};
