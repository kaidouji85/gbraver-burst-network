import { z } from "zod";

/** カジュアルマッチ入室成功 */
export type EnteredCasualMatch = {
  action: "entered-casual-match";
};

/** EnteredCasualMatch zodスキーマ */
export const EnteredCasualMatchSchema = z.object({
  action: z.literal("entered-casual-match"),
});

/**
 * 任意のオブジェクトをカジュアルマッチ入室成功にパースする
 * パースできない場合はnullを返す
 * @param data パース元となるオブジェクト
 * @return パース結果
 */
export function parseEnteredCasualMatch(data: unknown): EnteredCasualMatch | null {
  const result = EnteredCasualMatchSchema.safeParse(data);
  return result.success ? result.data : null;
}
