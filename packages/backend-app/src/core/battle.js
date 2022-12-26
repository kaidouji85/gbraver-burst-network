// @flow

import type { Player } from "gbraver-burst-core";
import type { GameState } from "gbraver-burst-core/lib/state/game-state";

import type { UserID } from "./user";

/** バトルID */
export type BattleID = string;

/** ステートが更新されるたびに発行されるユニークID */
export type FlowID = string;

/** バトルに参加するプレイヤー情報 */
export type BattlePlayer = Player & {
  /** ユーザID */
  userID: UserID,
  /**
   * AWS Websocket API Gateway コネクションID
   * 本プロパティは、ユーザへの告知に利用する
   * API Gateway、Dynamo DBなど複数レイヤーで本要素を利用するので、coreに含めている
   */
  connectionId: string,
};

/**
 * バトル情報
 * @template X プレイヤー情報
 */
export type Battle<X: BattlePlayer> = {
  /** バトルID */
  battleID: BattleID,
  /** フローID */
  flowID: FlowID,
  /** プレイヤー情報 */
  players: [X, X],
  /**
   * バトル更新ポーリングをするユーザのID
   * playersに含まれているユーザのIDを指定すること
   */
  poller: UserID,
  /** ステートヒストリー */
  stateHistory: GameState[],
};
