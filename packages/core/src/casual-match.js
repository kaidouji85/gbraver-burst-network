// @flow

import type {BattleRoom} from "./battle-room";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";

/** カジュアルマッチ */
export interface CasualMatch {
  /**
   * カジュアルマッチをスタートさせる
   *
   * @param armdozerId 選択したアームドーザID
   * @param pilotId 選択したパイロットID
   * @return バトルルーム準備
   */
  startCasualMatch(armdozerId: ArmDozerId, pilotId: PilotId): Promise<BattleRoom>;
}