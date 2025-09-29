import type { ArmdozerId, PilotId } from "gbraver-burst-core";

import type { BattleSDK } from "./battle-sdk";

/**
 * カジュアルマッチ
 * 本操作はログイン後に実行することを想定している
 */
export interface CasualMatch {
  /**
   * カジュアルマッチをスタートさせる
   *
   * @param armdozerId 選択したアームドーザID
   * @param pilotId 選択したパイロットID
   * @returns バトル
   */
  startCasualMatch(
    armdozerId: ArmdozerId,
    pilotId: PilotId,
  ): Promise<BattleSDK>;
}
