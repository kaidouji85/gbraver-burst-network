import { GameState } from "gbraver-burst-core";
import { FlowID } from "../core/battle";

/** バトル進行通知 */
export type BattleProgressed = {
  action: "battle-progressed";
  /** 発行されたフローID */
  flowID: FlowID;
  /** 更新されたゲームステート */
  update: GameState[];
};
