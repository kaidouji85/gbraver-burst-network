import { z } from "zod";

/** バトル強制終了 */
export type SuddenlyBattleEnd = {
  action: "suddenly-battle-end";
};

/** SuddenlyBattleEnd zodスキーマ */
export const SuddenlyBattleEndSchema = z.object({
  action: z.literal("suddenly-battle-end"),
});

/**
 * 任意オブジェクトをSuddenlyBattleEndにパースする
 * パースできない場合はnullを返す
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseSuddenlyBattleEnd(data: unknown): SuddenlyBattleEnd | null {
  const result = SuddenlyBattleEndSchema.safeParse(data);
  return result.success ? result.data : null;
}
