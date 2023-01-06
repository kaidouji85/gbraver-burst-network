import type { GameState } from "gbraver-burst-core";

/** バトル終了 */
export type BattleEnd = {
  action: "battle-end";

  /** 更新されたゲームステート */
  update: GameState[];
};

/**
 * 任意オブジェクトをBattleEndにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseBattleEnd(data: any): BattleEnd | null {
  /* eslint-enable */
  // TODO updateを正確に型チェックする
  return data?.action === "battle-end" && Array.isArray(data?.update)
    ? {
        action: data.action,
        update: data.update,
      }
    : null;
}
