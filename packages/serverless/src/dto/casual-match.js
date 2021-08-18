// @flow

import type {UserID} from './user';
import type {ArmDozerId, PilotId} from "gbraver-burst-core";

/** カジュアルマッチエントリ */
export type CasualMatchEntry = {
  userID: UserID;
  armdozerId: ArmDozerId,
  pitloId: PilotId
};