import { z } from "zod";

import {
  CanBattleProgressQueryFromPoller,
  CanBattleProgressQueryFromPollerSchema,
} from "../core/can-battle-progress";

/** バトル進行ポーリング */
export type BattleProgressPolling = CanBattleProgressQueryFromPoller & {
  action: "battle-progress-polling";
};

/** バトル進行ポーリング zodスキーマ */
export const BattleProgressPollingSchema =
  CanBattleProgressQueryFromPollerSchema.extend({
    action: z.literal("battle-progress-polling"),
  });

/**
 * 任意オブジェクトをBattleProgressPollingにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
export function parseBattleProgressPolling(
  origin: unknown,
): BattleProgressPolling | null {
  const result = BattleProgressPollingSchema.safeParse(origin);
  return result.success ? result.data : null;
}
