import { z } from "zod";

/** コマンド受取通知 */
export type AcceptCommand = {
  action: "accept-command";
};

/** AcceptCommand zodスキーマ */
export const AcceptCommandSchema: z.ZodSchema<AcceptCommand> = z.object({
  action: z.literal("accept-command"),
});

/**
 * 任意オブジェクトをAcceptCommandにパースする
 * パースできない場合はnullを返す
 * @param data パース元オブジェクト
 * @returns パース結果
 */
export function parseAcceptCommand(data: unknown): AcceptCommand | null {
  const result = AcceptCommandSchema.safeParse(data);
  return result.success ? result.data : null;
}
