import { RoomID } from "aws-sdk/clients/ivschat";
import { ArmDozerId, PilotId } from "gbraver-burst-core";

/** プライベートマッチルームエントリ */
export type enterPrivateMatchRoom = {
  type: "enter-private-match-room";
  /** ルームID */
  roomID: RoomID;
  /** 選択したアームドーザID */
  armdozerId: ArmDozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
}

