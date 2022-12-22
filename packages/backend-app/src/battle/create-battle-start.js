// @flow

import { toPlayer } from "../core/battle";
import type { UserID } from "../core/user";
import type { BattlesSchema } from "../dynamo-db/battles";
import type { BattleStart } from "../response/websocket-response";

/**
 * 戦闘開始オブジェクトを生成するヘルパー関数
 *
 * @param userID 戦闘開始オブジェクトを受け取るユーザのID
 * @param battle バトル情報
 * @return 生成結果
 */
export function createBattleStart(
  userID: UserID,
  battle: BattlesSchema
): BattleStart {
  const player =
    battle.players.find((v) => v.userID === userID) ?? battle.players[0];
  const respPlayer = toPlayer(player);
  const enemy =
    battle.players.find((v) => v.userID !== userID) ?? battle.players[0];
  const respEnemy = toPlayer(enemy);
  const isPoller = userID === battle.poller;
  return {
    action: "battle-start",
    player: respPlayer,
    enemy: respEnemy,
    battleID: battle.battleID,
    flowID: battle.flowID,
    stateHistory: battle.stateHistory,
    isPoller,
  };
}
