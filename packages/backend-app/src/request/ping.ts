import { z } from "zod";

/** ping */
export type Ping = {
  action: "ping";
};

/** ping zodスキーマ */
export const PingSchema = z.object({
  action: z.literal("ping"),
});

/**
 * 任意のオブジェクトをPingにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
export function parsePing(
  origin: unknown
): Ping | null {
  const result = PingSchema.safeParse(origin);
  return result.success ? result.data : null;
}