// @flow

import type {PlayerCommand, GameState} from "gbraver-burst-core";

/**
 * バトルルームID
 * 本IDはシステム内でユニークであると見なす
 */
export type BattleRoomID = string;

/**
 * バトルルーム
 */
export interface BattleRoom {
  /** ID */
  id: BattleRoomID;

  /**
   * ゲームを開始する
   *
   * @return ゲームの初期状態
   */
  start(): Promise<GameState[]>;

  /**
   * ゲームを進行させる
   *
   * @param commands プレイヤーのコマンド
   * @return ゲーム結果
   */
  progress(commands: PlayerCommand[]): Promise<GameState[]>;
}