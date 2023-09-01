import { z } from "zod"

/** バトル進行の準備ができていない */
export type NotReadyBattleProgress = {
  action: "not-ready-battle-progress";
};

/** NotReadyBattleProgress zodスキーマ */
export const NotReadyBattleProgressSchema = z.object({
  action: z.literal("not-ready-battle-progress"),
});

/**
 * 任意オブジェクトをNotReadyBattleProgressにパースする
 * パースできない場合はnullを返す
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseNotReadyBattleProgress(
  data: unknown,
): NotReadyBattleProgress | null {
  const result = NotReadyBattleProgressSchema.safeParse(data);
  return result.success ? result.data : null;
}
