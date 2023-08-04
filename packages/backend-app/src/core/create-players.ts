import { Player } from "gbraver-burst-core";

import { Battle, BattlePlayer } from "./battle";
import { toPlayer } from "./to-player";

/**
 * バトル情報からGブレイバーバーストコアのプレイヤーを生成する
 * @param battle バトル情報
 * @return 生成結果
 */
export function createPlayers(battle: Battle<BattlePlayer>): [Player, Player] {
  return [toPlayer(battle.players[0]), toPlayer(battle.players[1])];
}
