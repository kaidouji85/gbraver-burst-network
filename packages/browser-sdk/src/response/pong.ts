import { z } from "zod";

/** pingのレスポンス */
export type Pong = {
  action: "pong";
  /** メッセージ */
  message: string;
};

/** Pong zodスキーマ */
export const PongSchema = z.object({
  action: z.literal("pong"),
  message: z.string(),
});

/**
 * 任意のオブジェクトをPingResponseにパースする
 * パースできない場合はnullを返す
 * @param data パース元となるオブジェクト
 * @return パース結果
 */
export function parsePong(data: unknown): Pong | null {
  const result = PongSchema.safeParse(data);
  return result.success ? result.data : null;
}
