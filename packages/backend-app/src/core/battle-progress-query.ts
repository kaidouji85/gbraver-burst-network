import { BattleID, FlowID } from "./battle";

/** バトル進行 問合わせパラメータ */
export type BattleProgressQuery = {
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
};