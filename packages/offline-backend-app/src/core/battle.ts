import { GameState } from "gbraver-burst-core";

/** バトル管理情報 */
export type Battle = {
  /** バトルID */
  battleId: string;
  /** フローID */
  flowId: string;
  /** ゲームステートの履歴 */
  stateHistory: GameState[];
};
