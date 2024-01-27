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
  const isSameBattleIDs = new Set(objects.map((v) => v.battleID)).size === 1;
  const isSameFlowIDs = new Set(objects.map((v) => v.flowID)).size === 1;
  return isSameBattleIDs && isSameFlowIDs;
}
