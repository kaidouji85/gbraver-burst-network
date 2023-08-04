import { uniq } from "ramda";

import { Battle, BattlePlayer } from "./battle";
import { BattleCommand } from "./battle-command";
import { BattleProgressQuery } from "./battle-progress-query";

/**
 * 指定した文字列が全て同じ値か否かを判定するヘルパー関数
 * @param values 判定対象の文字列を配列で渡す
 * @return 判定結果、trueで全て同じ値である
 */
function isSameValues(values: string[]): boolean {
  return uniq(values).length === 1;
}

/**
 * バトル進行が出来るか否かを判定する
 * @param data バトル進行ポーリング
 * @param battle バトル情報
 * @param commands すべてのプレイヤーのバトルコマンド
 * @return 判定結果、trueでバトル進行ができる
 */
export function canProgressBattle(
  query: BattleProgressQuery,
  battle: Battle<BattlePlayer>,
  commands: [BattleCommand, BattleCommand],
): boolean {
  const isSameBattleIDs = isSameValues([
    query.battleID,
    battle.battleID,
    commands[0].battleID,
    commands[1].battleID,
  ]);
  const isSameFlowIDs = isSameValues([
    query.flowID,
    battle.flowID,
    commands[0].flowID,
    commands[1].flowID,
  ]);
  return isSameBattleIDs && isSameFlowIDs;
}
