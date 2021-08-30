// @flow

import type {UserID} from "./user";
import type {GameState} from "gbraver-burst-core/lib/state/game-state";
import type {Player} from "gbraver-burst-core";

/** バトルID */
export type BattleID = string;

/** ステートが更新されるたびに発行されるユニークID */
export type FlowID = string;

/** バトルに参加するプレイヤー情報 */
export type BattlePlayer = Player & {
  /** ユーザID */
  userID: UserID
};

/**
 * バトル情報
 * @template X プレイヤー情報
 */
export type Battle<X: BattlePlayer> = {
  /** バトルID */
  battleID: BattleID,
  /** フローID */
  flowID: string,
  /** プレイヤー情報 */
  players: [X, X],
  /** ステートヒストリー */
  stateHistory: GameState[],
  /**
   * バトル更新ポーリングをするユーザのID
   * playersに含まれているユーザのIDを指定すること
   */
  poller: UserID
};

/**
 * BattlePlayerをPlayerに変換する
 *
 * @param origin 変換元
 * @return 変換結果
 */
export function toPlayer(origin: BattlePlayer): Player {
  return {playerId: origin.playerId, armdozer: origin.armdozer, pilot: origin.pilot};
}