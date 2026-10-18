import { SignalContainer } from "../abort-controller/signal-container";
import { PrivateMatchRoomID } from "../browser-sdk/private-match/private-match";
import { parseJSON } from "../json/parse";
import { Reject, Resolve } from "../promise/promise";
import { BattleStart, parseBattleStart } from "../response/battle-start";
import { parseCouldNotPrivateMatchMaking } from "../response/cloud-not-private-match-making";
import { wait } from "../wait/wait";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * プライベートマッチングポーリング
 * @param websocket websocketクライアント
 * @param roomID ルームID
 * @param options オプション
 * @returns APIサーバからのレスポンス
 */
export async function privateMatchMakePolling(
  websocket: WebSocket,
  roomID: PrivateMatchRoomID,
  options?: Partial<SignalContainer>,
): Promise<BattleStart> {
  const signal = options?.signal;
  if (signal?.aborted) {
    return Promise.reject(signal.reason);
  }

  const maxPollingCount = 200;
  const pollingIntervalMilliSec = 3000;
  let pollingCount = 1;
  let lastPollingTime = 0;
  const polling = () => {
    pollingCount++;
    lastPollingTime = Date.now();
    sendToAPIServer(websocket, {
      action: "private-match-make-polling",
      roomID,
    });
  };

  polling();
  return waitUntil(
    websocket,
    async (e: MessageEvent, resolve: Resolve<BattleStart>, reject: Reject) => {
      try {
        const data = parseJSON(e.data);
        const cloudNotPrivateMatchMaking =
          parseCouldNotPrivateMatchMaking(data);
        const isOverPollingCount = maxPollingCount <= pollingCount;
        if (cloudNotPrivateMatchMaking && isOverPollingCount) {
          reject(new Error("max polling count over"));
          return;
        }

        if (cloudNotPrivateMatchMaking) {
          const pollingTime = Date.now() - lastPollingTime;
          const waitTime = Math.max(pollingIntervalMilliSec - pollingTime, 0);
          await wait(waitTime, options);
          polling();
          return;
        }

        const battleStart = parseBattleStart(data);
        if (battleStart) {
          resolve(battleStart);
        }
      } catch (error) {
        reject(error);
      }
    },
    options,
  );
}
