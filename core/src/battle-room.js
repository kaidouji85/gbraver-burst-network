// @flow

import type {GameState, PlayerId, Command} from "gbraver-burst-core";

/** バトルルーム準備完了 */
export type BattleRoomReady = {
  /** バトルルーム */
  battleRoom: BattleRoom,
  /** ゲームの初期状態 */
  initialState: GameState[],
  /** バトルルームから発行されたプレイヤーID */
  playerId: PlayerId,
};

/** バトルルーム準備 */
export interface PrepareBattleRoom {
  /**
   * バトルルームの準備が完了したら告知する
   *
   * @return 準備完了情報
   */
  onBattleRoomReady(): Promise<BattleRoomReady>;
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
   * @param command プレイヤーが入力するコマンド
   * @return ゲーム結果
   */
  progress(command: Command): Promise<GameState[]>;
}