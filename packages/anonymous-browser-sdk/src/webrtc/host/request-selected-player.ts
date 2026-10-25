import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { SignalContainer } from "../../abort-controller/signal-container";
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
 * @param options リクエストのオプション
 * @param options.dataChannel データチャンネル
 * @param options.flowID ゲームのフローID
 * @param options.signal Promise強制終了用シグナル
 * @returns ホストが選択したプレイヤー情報
 */
export const requestSelectedPlayer = (
  options: {
    dataChannel: RTCDataChannel;
    flowID: string;
  } & Partial<SignalContainer>,
): Promise<HostSelectedPlayer> => {
  const { dataChannel, flowID, signal } = options;
  let handler: ((event: MessageEvent) => void) | null = null;
  let onAbort: (() => void) | null = null;
  return new Promise<HostSelectedPlayer>((resolve, reject) => {
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

    if (onAbort) {
      signal?.removeEventListener("abort", onAbort);
    }
  });
};
