import { PrivateMatchRoomID } from "@gbraver-burst-network/browser-core";
import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { CouldNotPrivateMatchMaking } from "../response/cloud-not-private-match-making";
import { DestroyPrivateMatchRoom } from "../response/destroy-private-match-room";
import { EnteredPrivateMatchRoom } from "../response/entered-private-match-room";
import { NotChosenAsPrivateMatchPartner } from "../response/not-chosen-as-private-match-partner";
import { NotFoundPrivateMatchRoom } from "../response/not-found-private-match-room";
import {waitUntil} from "./wait-until";

export function enterPrivateMatchRoom(
  websocket: WebSocket,
  roomID: PrivateMatchRoomID,
  armdozerId: ArmDozerId,
  pilotId: PilotId
): Promise<
  | EnteredPrivateMatchRoom
  | NotFoundPrivateMatchRoom
  | CouldNotPrivateMatchMaking
  | NotChosenAsPrivateMatchPartner
  | DestroyPrivateMatchRoom
> {
  return waitUntil(websocket, resolve => {
    
  });
}
