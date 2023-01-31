import { PrivateMatchRoomID } from "@gbraver-burst-network/browser-core";
import { ArmDozerId, PilotId } from "gbraver-burst-core";

/** プライベートマッチルームエントリ */
export type EnterPrivateMatchRoom = {
  action: "enter-private-match-room";
  /** ルームID */
  roomID: PrivateMatchRoomID;
  /** 選択したアームドーザID */
  armdozerId: ArmDozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
};
