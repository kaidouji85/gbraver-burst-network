import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { UserID } from "./user";

/** ルームID */
export type PrivateMatchRoomID = string;

/** プライベートマッチルーム */
export type PrivateMatchRoom = {
  /** ルームID */
  roomID: PrivateMatchRoomID;
  /** ルーム作成者 */
  owner: UserID;
  /** ルーム作成者が選択したアームドーザID */
  armdozerId: ArmDozerId;
  /** ルーム作成者が選択したパイロットID */
  pilotId: PilotId;
};
