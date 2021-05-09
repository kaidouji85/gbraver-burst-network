// @flow

import type {BattleRoom} from "./battle-room";
import type {Armdozer} from "gbraver-burst-core/lib/player/armdozer";
import type {Pilot} from "gbraver-burst-core/lib/player/pilot";

/** カジュアルマッチ */
export interface CasualMatch {
  /**
   * カジュアルマッチをスタートさせる
   *
   * @param armdozer 選択したアームドーザ
   * @param pilot 選択したパイロット
   * @return バトルルーム準備
   */
  startCasualMatch(armdozer: Armdozer, pilot: Pilot): Promise<BattleRoom>;
}