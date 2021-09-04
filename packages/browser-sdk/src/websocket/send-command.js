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

    const parsedSuddenlyBattleEnd = parseSuddenlyBattleEnd(data);
    if (parsedSuddenlyBattleEnd) {
      reject(parsedSuddenlyBattleEnd);
      return;
    }

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
  const sendCommand = {action: 'send-command', battleID, flowID, command};
  sendToAPIServer(websocket, sendCommand);

  const battleProgressPolling = {action: 'battle-progress-polling', battleID, flowID};
  await wait(1000);
  sendToAPIServer(websocket, battleProgressPolling);

  const maxPollingCount = 100;
  let pollingCount = 1;
  return onMessage(websocket, async (e: MessageEvent, resolve: Resolve<BattleProgressed | BattleEnd>, reject: Reject): Promise<void> => {
    const data = parseJSON(e.data);

    const parsedSuddenlyBattleEnd = parseSuddenlyBattleEnd(data);
    if (parsedSuddenlyBattleEnd) {
      reject(parsedSuddenlyBattleEnd);
      return;
    }
    
    const parsedNotReadyBattleProgress = parseNotReadyBattleProgress(data);
    const isOverPollingCount = maxPollingCount <= pollingCount;
    if (parsedNotReadyBattleProgress && isOverPollingCount) {
      reject(new Error('max polling count over'));
      return;
    }

    if (parsedNotReadyBattleProgress) {
      await wait(3000);
      pollingCount ++;
      sendToAPIServer(websocket, battleProgressPolling);
      return;
    }

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