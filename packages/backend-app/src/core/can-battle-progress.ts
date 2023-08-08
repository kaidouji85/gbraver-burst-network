import { uniq } from "ramda";
import { z } from "zod";

import {
  Battle,
  BattleID,
  BattleIDSchema,
  BattlePlayer,
  FlowID,
  FlowIDSchema,
} from "./battle";
import { BattleCommand } from "./battle-command";

/**
 * 指定した文字列が全て同じ値か否かを判定するヘルパー関数
 * @param values 判定対象の文字列を配列で渡す
 * @return 判定結果、trueで全て同じ値である
 */
function isSameValues(values: string[]): boolean {
  return uniq(values).length === 1;
}

/** ポーリング実行者が送信したバトル進行チェックの問い合わせ */
export type CanBattleProgressQueryFromPoller = {
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
};

/** ポーリング実行者が送信したバトル進行チェックの問い合わせ zodスキーマ */
export const CanBattleProgressQueryFromPollerSchema = z.object({
  battleID: BattleIDSchema,
  flowID: FlowIDSchema,
});

/**
 * バトル進行が出来るか否かを判定する
 * @param query バトル進行クエリ
 * @param battle バトル情報
 * @param commands すべてのプレイヤーのバトルコマンド
 * @return 判定結果、trueでバトル進行ができる
 */
export function canProgressBattle(
  query: CanBattleProgressQueryFromPoller,
  battle: Battle<BattlePlayer>,
  commands: [BattleCommand, BattleCommand],
): boolean {
  const objects = [query, battle, ...commands];
  const isSameBattleIDs = isSameValues(objects.map((v) => v.battleID));
  const isSameFlowIDs = isSameValues(objects.map((v) => v.flowID));
  return isSameBattleIDs && isSameFlowIDs;
}
