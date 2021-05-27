// @flow

import type {Battle} from "./battle";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";

/** カジュアルマッチ */
export interface CasualMatch {
  /**
   * カジュアルマッチをスタートさせる
   *
   * @param armdozerId 選択したアームドーザID
   * @param pilotId 選択したパイロットID
   * @return バトル
   */
  startCasualMatch(armdozerId: ArmDozerId, pilotId: PilotId): Promise<Battle>;
}