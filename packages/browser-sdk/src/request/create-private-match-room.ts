import { ArmDozerId, PilotId } from "gbraver-burst-core";

/** プライベートマッチルーム生成 */
export type CreatePrivateMatchRoom = {
  action: "create-private-match-room";

  /** 選択したアームドーザのID */
  armdozerId: ArmDozerId;

  /** 選択したパイロットのID */
  pilotId: PilotId;
};