// @flow

import type {PlayerCommand, GameState} from "gbraver-burst-core";
import type {UserID} from "./user";
import type {PlayerId} from "gbraver-burst-core/lib/player/player";

/**
 * ユーザID、プレイヤーIDのマッピング
 */
export type UserIDPlayerIDMapping = {
  /** ユーザID */
  userID: UserID,
  /** プレイヤーID */
  playerID: PlayerId,
};

/** バトルルーム準備完了 */
export type BattleRoomReady = {
  /** バトルルーム */
  battleRoom: BattleRoom,
  /** ゲームの初期状態 */
  initialState: GameState[],
  /** ユーザID、プレイヤーIDのマッピング */
  idMappings: UserIDPlayerIDMapping[],
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