import { GameState, GameStateSchema } from "gbraver-burst-core";
import { z } from "zod";

/** バトル進行通知 */
export type BattleProgressed = {
  action: "battle-progressed";
  /** 発行されたフローID */
  flowID: string;
  /** 更新されたゲームステート */
  update: GameState[];
};

/** BattleProgressed zodスキーマ */
export const BattleProgressedSchema = z.object({
  action: z.literal("battle-progressed"),
  flowID: z.string(),
  update: z.array(GameStateSchema),
});

/**
 * 任意オブジェクトをBattleProgressedをパースする
 * パースできない場合はnullを返す
 * @param data パース元オブジェクト
 * @returns パース結果
 */
export function parseBattleProgressed(data: unknown): BattleProgressed | null {
  const result = BattleProgressedSchema.safeParse(data);
  return result.success ? result.data : null;
}
