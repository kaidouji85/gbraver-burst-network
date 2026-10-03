import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { PrivateMatchRoomID } from "../browser-sdk/private-match";

/** プライベートマッチルームエントリ */
export type EnterPrivateMatchRoom = {
  action: "enter-private-match-room";
  /** ルームID */
  roomID: PrivateMatchRoomID;
  /** 選択したアームドーザID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
};
