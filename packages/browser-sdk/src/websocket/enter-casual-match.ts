import type { ArmdozerId, PilotId } from "gbraver-burst-core";

import { parseJSON } from "../json/parse";
import type { Resolve } from "../promise/promise";
import type { BattleStart } from "../response/battle-start";
import { parseBattleStart } from "../response/battle-start";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * カジュアルマッチを開始する
 *
 * @param websocket websocketクライアント
 * @param armdozerId アームドーザID
 * @param pilotId パイロットID
 * @returns バトル情報
 */
export function enterCasualMatch(
  websocket: WebSocket,
  armdozerId: ArmdozerId,
  pilotId: PilotId,
): Promise<BattleStart> {
  sendToAPIServer(websocket, {
    action: "enter-casual-match",
    armdozerId,
    pilotId,
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<BattleStart>): void => {
      const data = parseJSON(e.data);
      const response = parseBattleStart(data);
      response && resolve(response);
    },
  );
}
