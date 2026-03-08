import { GameState } from "gbraver-burst-core";

/** バトル終了 */
export type BattleEnd = {
  action: "battle-end";
  /** 更新されたゲームステート */
  update: GameState[];
};
