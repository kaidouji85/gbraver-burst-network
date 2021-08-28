// @flow

import type {StartBattle} from "./response";
import {onMessage} from "./message";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";
import type {Resolve} from "../promise/promise";
import {parseJSON} from "../json/parse";

/**
 * カジュアルマッチを開始する
 *
 * @param websocket websocketクライアント
 * @param armdozerId アームドーザID
 * @param pilotId パイロットID
 * @return バトル情報
 */
export function enterCasualMatch(websocket: WebSocket, armdozerId: ArmDozerId, pilotId: PilotId): Promise<StartBattle> {
  websocket.send(JSON.stringify({action: 'enter-casual-match', armdozerId, pilotId}));
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<StartBattle>): void => {
    const data = parseJSON(e.data);
    const response = (data: StartBattle); // TODO パース関数を作る
    resolve(response);
  });
}