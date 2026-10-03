import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { sendToAPIServer } from "./send-to-api-server";
import { parseJSON } from "../json/parse";
import { BattleStart, BattleStartSchema } from "../response/battle-start";
import { waitUntil } from "./wait-until";
import { Reject, Resolve } from "../promise/promise";
import { CloudNotRematchMakingSchema } from "../response/cloud-not-rematch-making";
import { wait } from "../wait/wait";

/**
 * ホスト側の再戦マッチメイク
 * @param options ホスト側の再戦マッチメイクに必要なオプション
 * @param options.websocket WebSocketインスタンス
 * @param options.roomID ルームID
 * @param options.armdozerId アームドーザID
 * @param options.pilotId パイロットID
 * @returns バトルスタート情報
 */
export const rematchMakingHost = async (options: {
  websocket: WebSocket;
  roomID: string;
  armdozerId: ArmdozerId;
  pilotId: PilotId;
}): Promise<BattleStart> => {
  const { websocket, roomID, armdozerId, pilotId } = options;
  sendToAPIServer(websocket, {
    action: "enter-rematch",
    roomID,
    armdozerId,
    pilotId,
  });

  const maxPollingCount = 200;
  const pollingIntervalMilliSec = 3000;
  let pollingCount = 1;
  let lastPollingTime = 0;
  const polling = () => {
    pollingCount++;
    lastPollingTime = Date.now();
    sendToAPIServer(websocket, {
      action: "rematch-make-polling",
      roomID,
    });
  };

  polling();
  return waitUntil(
    websocket,
    async (e: MessageEvent, resolve: Resolve<BattleStart>, reject: Reject) => {
      const data = parseJSON(e.data);
      const cloudNotRematchMaking =
        CloudNotRematchMakingSchema.safeParse(data).success;
      const isOverPollingCount = maxPollingCount <= pollingCount;
      if (cloudNotRematchMaking && isOverPollingCount) {
        reject(new Error("max polling count over"));
        return;
      }

      if (cloudNotRematchMaking) {
        const pollingTime = Date.now() - lastPollingTime;
        const waitTime = Math.max(pollingIntervalMilliSec - pollingTime, 0);
        await wait(waitTime);
        polling();
        return;
      }

      const battleStart = BattleStartSchema.safeParse(data);
      if (battleStart.success) {
        resolve(battleStart.data);
      }
    },
  );
};
