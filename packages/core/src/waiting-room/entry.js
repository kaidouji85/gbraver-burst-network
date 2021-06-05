// @flow

import type {ArmDozerId, PilotId} from 'gbraver-burst-core';
import type {SessionID} from "../session";

/** エントリ */
export type Entry = {
  /** エントリしたセッションのID */
  sessionID: SessionID,
  /** アームドーザID */
  armdozerId: ArmDozerId,
  /** パイロットID */
  pilotId: PilotId,
};