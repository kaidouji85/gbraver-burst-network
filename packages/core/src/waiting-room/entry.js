// @flow

import type {UserID} from '../user';
import type {ArmDozerId, PilotId} from 'gbraver-burst-core';

/** エントリ */
export type Entry = {
  /** エントリしたユーザのID */
  userID: UserID,
  /** アームドーザID */
  armdozerId: ArmDozerId,
  /** パイロットID */
  pilotId: PilotId,
};