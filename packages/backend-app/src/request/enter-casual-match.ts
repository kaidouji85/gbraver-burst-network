import { z } from "zod";

/** カジュアルマッチエントリのリクエストボディ */
export type EnterCasualMatch = {
  action: "enter-casual-match";
  /** 選択したアームドーザのID */
  armdozerId: string;
  /** 選択したパイロットのID */
  pilotId: string;
};

/** カジュアルマッチエントリのリクエストボディ zodスキーマ */
export const EnterCasualMatchSchema = z.object({
  action: z.literal("enter-casual-match"),
  armdozerId: z.string(),
  pilotId: z.string(),
});

/**
 * 任意オブジェクトをカジュアルマッチエントリに変換する
 * 変換できない場合はnullを返す
 *
 * @param origin 変換元のリクエストボディ
 * @returns 変換結果
 */
export function parseEnterCasualMatch(
  origin: unknown,
): EnterCasualMatch | null {
  const result = EnterCasualMatchSchema.safeParse(origin);
  return result.success ? result.data : null;
}
