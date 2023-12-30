import { BattlePlayer } from "./battle";
import { BattleCommand } from "./battle-command";

/** ゲーム参加プレイヤーのバトルコマンドを取得 */
export interface BattleCommandsFetcher {
  /**
   * ゲーム参加プレイヤーのバトルコマンドを取得する
   * @param players ゲーム参加プレイヤー
   * @return 取得結果、取得できなかった場合はnull
   */
  fetch(
    players: [BattlePlayer, BattlePlayer],
  ): Promise<[BattleCommand, BattleCommand] | null>;
}
