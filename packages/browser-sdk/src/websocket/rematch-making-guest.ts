import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { SignalContainer } from "../abort-controller/signal-container";
import { parseJSON } from "../json/parse";
import { Resolve } from "../promise/promise";
import { BattleStart, BattleStartSchema } from "../response/battle-start";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * ゲスト側の再戦マッチメイク
 * @param options オプション
 * @param options.signal アボートシグナル
 * @param options.websocket WebSocketインスタンス
 * @param options.roomID ルームID
 * @param options.armdozerId アームドーザID
 * @param options.pilotId パイロットID
 * @returns バトル開始情報
 */
export const rematchMakingGuest = (
  options: Partial<SignalContainer> & {
    websocket: WebSocket;
    roomID: string;
    armdozerId: ArmdozerId;
    pilotId: PilotId;
  },
): Promise<BattleStart> => {
  const { websocket, roomID, armdozerId, pilotId, signal } = options;
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  sendToAPIServer(websocket, {
    action: "enter-rematch",
    roomID,
    armdozerId,
    pilotId,
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<BattleStart>) => {
      const data = parseJSON(e.data);
      const battleStart = BattleStartSchema.safeParse(data);
      if (battleStart.success) {
        resolve(battleStart.data);
      }
    },
    options,
  );
};
