// @flow

import type { Player } from "gbraver-burst-core";

import type { BattlePlayer } from "./battle";

/**
 * BattlePlayerをPlayerに変換する
 *
 * @param origin 変換元
 * @return 変換結果
 */
export function toPlayer(origin: BattlePlayer): Player {
  return {
    playerId: origin.playerId,
    armdozer: origin.armdozer,
    pilot: origin.pilot,
  };
}
