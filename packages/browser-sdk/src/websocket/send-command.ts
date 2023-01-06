import type { Command } from "gbraver-burst-core";

import { parseJSON } from "../json/parse";
import type { Reject, Resolve } from "../promise/promise";
import type { AcceptCommand } from "../response/accept-command";
import { parseAcceptCommand } from "../response/accept-command";
import type { BattleEnd } from "../response/battle-end";
import { parseBattleEnd } from "../response/battle-end";
import type { BattleProgressed } from "../response/battle-progressed";
import { parseBattleProgressed } from "../response/battle-progressed";
import { parseNotReadyBattleProgress } from "../response/not-ready-battle-progress";
import { wait } from "../wait/wait";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

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
export function sendCommand(
  websocket: WebSocket,
  battleID: string,
  flowID: string,
  command: Command
): Promise<BattleProgressed | BattleEnd> {
  sendToAPIServer(websocket, {
    action: "send-command",
    battleID,
    flowID,
    command,
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<BattleProgressed | BattleEnd>) => {
      const data = parseJSON(e.data);
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
    }
  );
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
export async function sendCommandWithPolling(
  websocket: WebSocket,
  battleID: string,
  flowID: string,
  command: Command
): Promise<BattleProgressed | BattleEnd> {
  const maxPollingCount = 100;
  const pollingIntervalMilliSec = 3000;
  let pollingCount = 1;
  let lastPollingTime = 0;

  const battleProgressPolling = () => {
    pollingCount++;
    lastPollingTime = Date.now();
    sendToAPIServer(websocket, {
      action: "battle-progress-polling",
      battleID,
      flowID,
    });
  };

  sendToAPIServer(websocket, {
    action: "send-command",
    battleID,
    flowID,
    command,
  });
  await waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<AcceptCommand>) => {
      const data = parseJSON(e.data);
      const acceptCommand = parseAcceptCommand(data);
      acceptCommand && resolve(acceptCommand);
    }
  );
  battleProgressPolling();
  return waitUntil(
    websocket,
    async (
      e: MessageEvent,
      resolve: Resolve<BattleProgressed | BattleEnd>,
      reject: Reject
    ): Promise<void> => {
      const data = parseJSON(e.data);
      const notReadyBattleProgress = parseNotReadyBattleProgress(data);
      const isOverPollingCount = maxPollingCount <= pollingCount;

      if (notReadyBattleProgress && isOverPollingCount) {
        reject(new Error("max polling count over"));
        return;
      }

      if (notReadyBattleProgress) {
        const pollingTime = Date.now() - lastPollingTime;
        const waitTime = Math.max(pollingIntervalMilliSec - pollingTime, 0);
        await wait(waitTime);
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
    }
  );
}
