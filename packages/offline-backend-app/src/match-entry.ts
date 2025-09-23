import { ArmdozerId, PilotId } from "gbraver-burst-core";

/** マッチエントリー */
export type MatchEntry = {
  /** コネクションID */
  connectionId: string;
  /** アームドーザID */
  armdozerId: ArmdozerId;
  /** パイロットID */
  pilotId: PilotId;
};
