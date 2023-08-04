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

/**
 * バトル進行可否の判断条件
 * 関連するオブジェクトが本プロパティの値と一致していればバトル進行ができる
 */
export type CanBattleProgressCondition = {
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
};

/**
 * バトル進行が出来るか否かを判定する
 * @param condition バトル進行クエリ
 * @param battle バトル情報
 * @param commands すべてのプレイヤーのバトルコマンド
 * @return 判定結果、trueでバトル進行ができる
 */
export function canProgressBattle(
  condition: CanBattleProgressCondition,
  battle: Battle<BattlePlayer>,
  commands: [BattleCommand, BattleCommand],
): boolean {
  const objects = [condition, battle, ...commands];
  const isSameBattleIDs = isSameValues(objects.map((v) => v.battleID));
  const isSameFlowIDs = isSameValues(objects.map((v) => v.flowID));
  return isSameBattleIDs && isSameFlowIDs;
}
