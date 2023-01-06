import type { ArmDozerId, PilotId } from "gbraver-burst-core";
import type { Battle } from "./battle";

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
   * @return バトル
   */
  startCasualMatch(armdozerId: ArmDozerId, pilotId: PilotId): Promise<Battle>;
}