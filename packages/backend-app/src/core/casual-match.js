// @flow

import type { UserID } from "./user";
import type { ArmDozerId, PilotId } from "gbraver-burst-core";

/** カジュアルマッチエントリ */
export type CasualMatchEntry = {
  /** エントリーするユーザのID */
  userID: UserID,
  /** 選択したアームドーザID */
  armdozerId: ArmDozerId,
  /** 選択したパイロットID */
  pilotId: PilotId,
};
