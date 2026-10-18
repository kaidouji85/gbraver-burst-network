import { ArmdozerId, PilotId } from "gbraver-burst-core";

/** 再戦ルームにエントリ */
export type EnterRematch = {
  action: "enter-rematch";
  /** ルームID */
  roomID: string;
  /** 選択したアームドーザID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
};
