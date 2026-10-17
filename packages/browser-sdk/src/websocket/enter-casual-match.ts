import type { ArmdozerId, PilotId } from "gbraver-burst-core";

import type { SignalContainer } from "../abort-controller/signal-container";
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
 * @param options オプション
 * @returns バトル情報
 */
export function enterCasualMatch(
  websocket: WebSocket,
  armdozerId: ArmdozerId,
  pilotId: PilotId,
  options?: Partial<SignalContainer>,
): Promise<BattleStart> {
  const signal = options?.signal;
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

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
      if (response) {
        resolve(response);
      }
    },
    options,
  );
}
