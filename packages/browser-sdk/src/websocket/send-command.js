// @flow

import type {Command} from "gbraver-burst-core";
import type {BattleProgressed} from "../response/battle-progressed";
import type {BattleEnd} from "../response/battle-end";
import {sendToAPIServer} from "./send-to-api-server";
import {onMessage} from "./message";
import type {Reject, Resolve} from "../promise/promise";
import {parseBattleProgressed} from "../response/battle-progressed";
import {parseJSON} from "../json/parse";
import {parseBattleEnd} from "../response/battle-end";
import {wait} from "../wait/wait";
import {parseNotReadyBattleProgress} from "../response/not-ready-battle-progress";
import {parseSuddenlyBattleEnd} from "../response/suddenly-battle-end";

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
  return onMessage(websocket, (e: MessageEvent, resolve: Resolve<BattleProgressed | BattleEnd>, reject: Reject) => {
    const data = parseJSON(e.data);

    const suddenlyBattleEnd = parseSuddenlyBattleEnd(data);
    if (suddenlyBattleEnd) {
      reject(suddenlyBattleEnd);
      return;
    }

    const battleProgressed = parseBattleProgressed(data);
    if (battleProgressed) {
      resolve(battleProgressed);
      return;
    }

    const battleEnd = parseBattleEnd(data);
    if (battleEnd) {
      resolve(battleEnd);
      return;
    }
  });
}

/**
 * 更新確認ポーリング付きでAPIサーバにコマンド送信を行う
 *
 * @param websocket Websocketクライアント
 * @param battleID バトルID
 * @param flowID フローID
 * @param command コマンド
 * @return APIサーバからのレスポンス
 */
export async function sendCommandWithPolling(websocket: WebSocket, battleID: string, flowID: string, command: Command): Promise<BattleProgressed | BattleEnd> {
  const maxPollingCount = 100;
  let pollingCount = 1;
  const battleProgressPolling = () => {
    pollingCount ++;
    sendToAPIServer(websocket, {action: 'battle-progress-polling', battleID, flowID});
  };

  sendToAPIServer(websocket, {action: 'send-command', battleID, flowID, command});
  await wait(1000);
  battleProgressPolling();
  return onMessage(websocket, async (e: MessageEvent, resolve: Resolve<BattleProgressed | BattleEnd>, reject: Reject): Promise<void> => {
    const data = parseJSON(e.data);

    const suddenlyBattleEnd = parseSuddenlyBattleEnd(data);
    if (suddenlyBattleEnd) {
      reject(suddenlyBattleEnd);
      return;
    }
    
    const notReadyBattleProgress = parseNotReadyBattleProgress(data);
    const isOverPollingCount = maxPollingCount <= pollingCount;
    if (notReadyBattleProgress && isOverPollingCount) {
      reject(new Error('max polling count over'));
      return;
    }

    if (notReadyBattleProgress) {
      await wait(3000);
      battleProgressPolling();
      return;
    }

    const battleProgressed = parseBattleProgressed(data);
    if (battleProgressed) {
      resolve(battleProgressed);
      return;
    }

    const battleEnd = parseBattleEnd(data);
    if (battleEnd) {
      resolve(battleEnd);
      return;
    }
  });
}