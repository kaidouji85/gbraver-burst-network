// @flow

import type {ArmDozerId, PilotId} from 'gbraver-burst-core';
import type {UserID} from "../users/user";

/** エントリ */
export type Entry = {
  /** エントリしたユーザのID */
  userID: UserID,
  /** アームドーザID */
  armdozerId: ArmDozerId,
  /** パイロットID */
  pilotId: PilotId,
};