import type { ArmdozerId, PilotId } from "gbraver-burst-core";

/** カジュアルマッチエントリのリクエストボディ */
export type EnterCasualMatch = {
  action: "enter-casual-match";

  /** 選択したアームドーザのID */
  armdozerId: ArmdozerId;

  /** 選択したパイロットのID */
  pilotId: PilotId;
};
