import { ArmdozerId, PilotId } from "gbraver-burst-core";

/** プライベートマッチルーム生成 */
export type CreatePrivateMatchRoom = {
  action: "create-private-match-room";

  /** 選択したアームドーザのID */
  armdozerId: ArmdozerId;

  /** 選択したパイロットのID */
  pilotId: PilotId;
};
