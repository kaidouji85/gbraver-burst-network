import { BattleProgressQuery } from "../core/battle-progress-query";

/** バトル進行ポーリング */
export type BattleProgressPolling = BattleProgressQuery & {
  action: "battle-progress-polling";
};

/**
 * 任意オブジェクトをBattleProgressPollingにパースする
 * パースできない場合はnullを返す
 *
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseBattleProgressPolling(
  origin: any,
): BattleProgressPolling | null {
  /* eslint-enable */
  return origin?.action === "battle-progress-polling" &&
    typeof origin?.battleID === "string" &&
    typeof origin?.flowID === "string"
    ? {
        action: origin.action,
        battleID: origin.battleID,
        flowID: origin.flowID,
      }
    : null;
}
