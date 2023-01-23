import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { PrivateMatchRoomID } from "./private-match-room";
import { UserID } from "./user";

/** プライベートマッチエントリ */
export type PrivateMatchEntry = {
  /** エントリするルームID */
  roomID: PrivateMatchRoomID;
  /** エントリするユーザID */
  userID: UserID;
  /** 選択したアームドーザのID */
  armdozerId: ArmDozerId;
  /** 選択したパイロットのID */
  pilotId: PilotId;
};
