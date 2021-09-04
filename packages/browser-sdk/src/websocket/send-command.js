// @flow

import type {Command} from "gbraver-burst-core";
import type {BattleProgressed} from "../response/battle-progressed";
import type {BattleEnd} from "../response/battle-end";
import {sendToAPIServer} from "./send-to-api-server";
import {onMessage} from "./message";
import type {Resolve} from "../promise/promise";
import {parseBattleProgressed} from "../response/battle-progressed";
import {parseJSON} from "../json/parse";
import {parseBattleEnd} from "../response/battle-end";

/**
 * コマンドをAPIサーバに送信する
 * バトル進行、バトル終了がサーバが送信されるまで待機して、その内容を返す
 *
 * @param websocket websocketクライアント
 * @param battleID バトルID
 * @param flowID フローID
 * @param command コマンド
 * @return サーバからのレスポンス
 */
export function sendCommand(websocket: WebSocket, battleID: string, flowID: string, command: Command): Promise<BattleProgressed | BattleEnd> {
  const data = {action: 'send-command', battleID, flowID, command};
  sendToAPIServer(websocket, data);
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<BattleProgressed | BattleEnd>) => {
    const data = parseJSON(e.data);

    const parsedBattleProgressed = parseBattleProgressed(data);
    if (parsedBattleProgressed) {
      resolve(parsedBattleProgressed);
      return;
    }

    const parsedBattleEnd = parseBattleEnd(data);
    if (parsedBattleEnd) {
      resolve(parsedBattleEnd);
      return;
    }
  });
}