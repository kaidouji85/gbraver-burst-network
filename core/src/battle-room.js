// @flow

import type {PlayerCommand, GameState} from "gbraver-burst-core";

/** バトルルームの準備が完了した時に渡されるオブジェクト */
export type BattleRoomReady = {
  /** バトルルーム */
  battleRoom: BattleRoom,
  /** ゲームの初期状態 */
  initialState: GameState[],
};

/** バトルルーム準備 */
export interface PrepareBattleRoom {
  /**
   * バトルルームの準備が完了したら告知する
   */
  onBattleRoomReady: Promise<BattleRoomReady>;
}

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
   * ゲームを進行させる
   *
   * @param commands プレイヤーのコマンド
   * @return ゲーム結果
   */
  progress(commands: PlayerCommand[]): Promise<GameState[]>;
}