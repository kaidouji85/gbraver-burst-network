import { startGBraverBurst } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import type { Battle, BattlePlayer } from "./battle";
import { toPlayer } from "./to-player";

/**
 * バトル情報を生成する
 * @template X プレイヤー情報のデータ型
 * @param players プレイヤー情報
 * @returns 生成結果
 */
export function createBattle<X extends BattlePlayer>(
  players: [X, X],
): Battle<X> {
  const core = startGBraverBurst([toPlayer(players[0]), toPlayer(players[1])]);
  const poller = players[0].userID;
  return {
    battleID: uuidv4(),
    flowID: uuidv4(),
    stateHistory: core.stateHistory(),
    players,
    poller,
  };
}
