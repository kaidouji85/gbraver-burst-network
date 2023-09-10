import { GameState, GameStateSchema } from "gbraver-burst-core";
import { z } from "zod";

/** バトル終了 */
export type BattleEnd = {
  action: "battle-end";
  /** 更新されたゲームステート */
  update: GameState[];
};

/** BattleEnd zodスキーマ */
export const BattleEndSchema = z.object({
  action: z.literal("battle-end"),
  update: z.array(GameStateSchema),
});

/**
 * 任意オブジェクトをBattleEndにパースする
 * パースできない場合はnullを返す
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseBattleEnd(data: unknown): BattleEnd | null {
  const result = BattleEndSchema.safeParse(data);
  return result.success ? result.data : null;
}
