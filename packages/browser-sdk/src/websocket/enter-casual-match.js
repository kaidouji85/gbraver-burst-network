// @flow

import type {BattleStart} from "../response/battle-start";
import {parseBattleStart} from "../response/battle-start";
import {onMessage} from "./message";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";
import type {Resolve} from "../promise/promise";
import {parseJSON} from "../json/parse";
import {sendToAPIServer} from "./send-to-api-server";

/**
 * カジュアルマッチを開始する
 *
 * @param websocket websocketクライアント
 * @param armdozerId アームドーザID
 * @param pilotId パイロットID
 * @return バトル情報
 */
export function enterCasualMatch(websocket: WebSocket, armdozerId: ArmDozerId, pilotId: PilotId): Promise<BattleStart> {
  sendToAPIServer(websocket, {action: 'enter-casual-match', armdozerId, pilotId});
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<BattleStart>): void => {
    const data = parseJSON(e.data);
    const response = parseBattleStart(data);
    response && resolve(response);
  });
}