import type { Command, GameState, Player } from "gbraver-burst-core";
import { Observable } from "rxjs";

/**
 * バトル
 * 本操作はログイン後に実行することを想定している
 */
export interface Battle {
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
   * @returns ゲーム結果
   */
  progress(command: Command): Promise<GameState[]>;

  /**
   * バトル強制終了の通知ストリーム
   *
   * @returns 通知ストリーム
   */
  suddenlyBattleNotifier(): Observable<unknown>;
}
