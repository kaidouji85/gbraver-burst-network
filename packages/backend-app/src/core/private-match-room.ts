import {ArmDozerId, PilotId} from "gbraver-burst-core";

import {UserID} from "./user";

/** ルームID */
export type RoomID = string;

/** プライベートマッチルーム */
export type PrivateMatchRoom = {
  /** ルームID */
  roomID: RoomID;
  /** ルーム作成者 */
  owner: UserID;
  /** ルーム作成者が選択したアームドーザID */
  armdozerId: ArmDozerId;
  /** ルーム作成者が選択したパイロットID */
  pilotId: PilotId;
};