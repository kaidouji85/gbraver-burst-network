// @flow

import type {Player} from "gbraver-burst-core/lib/player/player";
import type {UserID} from "./user";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";

/** バトルID */
export type BattleID = string;

/** ステートが更新されるたびに発行されるユニークID */
export type FlowID = string;

/** バトルに参加するプレイヤー情報 */
export type BattlePlayer = Player & {
  userID: UserID
};

/** バトル情報 */
export type Battle = {
  /** バトルID */
  battleID: BattleID,
  /** フローID */
  flowID: string,
  /** プレイヤー情報 */
  players: [BattlePlayer, BattlePlayer],
  /** ステートヒストリー */
  stateHistory: GameState[],
};