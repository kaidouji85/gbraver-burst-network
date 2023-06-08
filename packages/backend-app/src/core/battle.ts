import type { GameState, Player } from "gbraver-burst-core";
import { z } from "zod";

import type { UserID } from "./user";
import type { WSAPIGatewayConnectionId } from "./ws-api-gateway-connection";

/** バトルID */
export type BattleID = string;

/** バトルID zodスキーマ */
export const BattleIDSchema = z.string();

/** ステートが更新されるたびに発行されるユニークID */
export type FlowID = string;

/** FLowID zodスキーマ */
export const FlowIDSchema = z.string();

/** バトルに参加するプレイヤー情報 */
export type BattlePlayer = Player & {
  /** ユーザID */
  userID: UserID;

  /** コネクションID */
  connectionId: WSAPIGatewayConnectionId;
};

/**
 * バトル情報
 * @template X プレイヤー情報
 */
export type Battle<X extends BattlePlayer> = {
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
  /** プレイヤー情報 */
  players: [X, X];
  /**
   * バトル更新ポーリングをするユーザのID
   * playersに含まれているユーザのIDを指定すること
   */
  poller: UserID;
  /** ステートヒストリー */
  stateHistory: GameState[];
};
