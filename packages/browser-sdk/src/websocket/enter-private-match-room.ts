import { PrivateMatchRoomID } from "@gbraver-burst-network/browser-core";
import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { parseJSON } from "../json/parse";
import { Resolve } from "../promise/promise";
import { BattleStart, parseBattleStart } from "../response/battle-start";
import {
  CouldNotPrivateMatchMaking,
  parseCouldNotPrivateMatchMaking,
} from "../response/cloud-not-private-match-making";
import {
  DestroyPrivateMatchRoom,
  parseDestroyPrivateMatchRoom,
} from "../response/destroy-private-match-room";
import {
  NotChosenAsPrivateMatchPartner,
  parseNotChosenAsPrivateMatchPartner,
} from "../response/not-chosen-as-private-match-partner";
import {
  NotFoundPrivateMatchRoom,
  parseNotFoundPrivateMatchRoom,
} from "../response/not-found-private-match-room";
import { sendToAPIServer } from "./send-to-api-server";
import { waitUntil } from "./wait-until";

/** プライベートマッチルームの入室結果 */
type EnterPrivateMatchRoomResponse =
  | BattleStart
  | NotFoundPrivateMatchRoom
  | CouldNotPrivateMatchMaking
  | NotChosenAsPrivateMatchPartner
  | DestroyPrivateMatchRoom;

/**
 * プライベートマッチルームに入室する
 * @param websocket websocketクライアント
 * @param roomID ルームID
 * @param armdozerId アームドーザID
 * @param pilotId パイロットID
 * @return 入室結果
 */
export function enterPrivateMatchRoom(
  websocket: WebSocket,
  roomID: PrivateMatchRoomID,
  armdozerId: ArmDozerId,
  pilotId: PilotId
): Promise<EnterPrivateMatchRoomResponse> {
  sendToAPIServer(websocket, {
    action: "enter-private-match-room",
    roomID,
    armdozerId,
    pilotId,
  });
  return waitUntil(
    websocket,
    (e: MessageEvent, resolve: Resolve<EnterPrivateMatchRoomResponse>) => {
      const data = parseJSON(e.data);

      const battleStart = parseBattleStart(data);
      if (battleStart) {
        resolve(battleStart);
      }

      const notFoundPrivateMatchRoom = parseNotFoundPrivateMatchRoom(data);
      if (notFoundPrivateMatchRoom) {
        resolve(notFoundPrivateMatchRoom);
      }

      const couldNotPrivateMatchMaking = parseCouldNotPrivateMatchMaking(data);
      if (couldNotPrivateMatchMaking) {
        resolve(couldNotPrivateMatchMaking);
      }

      const notChosenAsPrivateMatchPartner =
        parseNotChosenAsPrivateMatchPartner(data);
      if (notChosenAsPrivateMatchPartner) {
        resolve(notChosenAsPrivateMatchPartner);
      }

      const destroyPrivateMatchRoom = parseDestroyPrivateMatchRoom(data);
      if (destroyPrivateMatchRoom) {
        resolve(destroyPrivateMatchRoom);
      }
    }
  );
}
