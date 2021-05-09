// @flow

import type {GameState, Command} from "gbraver-burst-core";
import type {Player} from "gbraver-burst-core/lib/player/player";

/** バトルルーム */
export interface BattleRoom {
  /** プレイヤーの情報 */
  player: Player;
  /** 対戦相手の情報 */
  enemy: Player;
  /** ゲームの初期状態 */
  initialState: GameState[];

  /**
   * バトルを進行させる
   *
   * @param command プレイヤーが入力するコマンド
   * @return ゲーム結果
   */
  progress(command: Command): Promise<GameState[]>;
}