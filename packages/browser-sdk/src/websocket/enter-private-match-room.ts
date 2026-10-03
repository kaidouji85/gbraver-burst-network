import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { PrivateMatchRoomID } from "../browser-sdk/private-match";
import { parseJSON } from "../json/parse";
import { Resolve } from "../promise/promise";
import { BattleStart, parseBattleStart } from "../response/battle-start";
import {
  parseRejectPrivateMatchEntry,
  RejectPrivateMatchEntry,
} from "../response/reject-private-match-entry";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/**
 * プライベートマッチルームに入室する
 * @param websocket websocketクライアント
 * @param roomID ルームID
 * @param armdozerId アームドーザID
 * @param pilotId パイロットID
 * @returns 入室結果
 */
export function enterPrivateMatchRoom(
  websocket: WebSocket,
  roomID: PrivateMatchRoomID,
  armdozerId: ArmdozerId,
  pilotId: PilotId,
): Promise<BattleStart | RejectPrivateMatchEntry> {
  sendToAPIServer(websocket, {
    action: "enter-private-match-room",
    roomID,
    armdozerId,
    pilotId,
  });
  return waitUntil(
    websocket,
    (
      e: MessageEvent,
      resolve: Resolve<BattleStart | RejectPrivateMatchEntry>,
    ) => {
      const data = parseJSON(e.data);

      const battleStart = parseBattleStart(data);
      if (battleStart) {
        resolve(battleStart);
      }

      const rejectPrivateMatchEntry = parseRejectPrivateMatchEntry(data);
      if (rejectPrivateMatchEntry) {
        resolve(rejectPrivateMatchEntry);
      }
    },
  );
}
