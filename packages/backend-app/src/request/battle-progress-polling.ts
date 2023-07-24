import type { BattleID, FlowID } from "../core/battle";

/** バトル進行ポーリング */
export type BattleProgressPolling = {
  action: "battle-progress-polling";

  /** バトルID */
  battleID: BattleID;

  /** フローID */
  flowID: FlowID;
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
