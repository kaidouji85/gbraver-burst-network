// @flow

import type { GameState } from "gbraver-burst-core";

/** バトル進行通知 */
export type BattleProgressed = {
  action: "battle-progressed",
  /** 発行されたフローID */
  flowID: string,
  /** 更新されたゲームステート */
  update: GameState[],
};

/**
 * 任意オブジェクトをBattleProgressedをパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseBattleProgressed(data: Object): ?BattleProgressed {
  // TODO updateを正確に型チェックする
  return data?.action === "battle-progressed" &&
    typeof data?.flowID === "string" &&
    Array.isArray(data?.update)
    ? { action: data.action, flowID: data.flowID, update: data.update }
    : null;
}
