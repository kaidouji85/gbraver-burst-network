import { uniq } from "ramda";

import { Battle, BattleID, BattlePlayer, FlowID } from "./battle";
import { BattleCommand } from "./battle-command";

/**
 * 指定した文字列が全て同じ値か否かを判定するヘルパー関数
 * @param values 判定対象の文字列を配列で渡す
 * @return 判定結果、trueで全て同じ値である
 */
function isSameValues(values: string[]): boolean {
  return uniq(values).length === 1;
}

/** バトル進行可否のクエリ */
export type CanBattleProgressQuery = {
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
};

/**
 * バトル進行が出来るか否かを判定する
 * @param query バトル進行クエリ
 * @param battle バトル情報
 * @param commands すべてのプレイヤーのバトルコマンド
 * @return 判定結果、trueでバトル進行ができる
 */
export function canProgressBattle(
  query: CanBattleProgressQuery,
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
