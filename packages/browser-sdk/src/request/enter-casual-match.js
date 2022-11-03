// @flow

import type { ArmDozerId, PilotId } from "gbraver-burst-core";

/** カジュアルマッチエントリのリクエストボディ */
export type EnterCasualMatch = {
  action: "enter-casual-match",
  /** 選択したアームドーザのID */
  armdozerId: ArmDozerId,
  /** 選択したパイロットのID */
  pilotId: PilotId,
};
