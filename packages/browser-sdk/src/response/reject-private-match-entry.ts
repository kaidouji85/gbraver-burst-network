import { z } from "zod";

/** 何らかの理由でプライベートマッチに参加できなかった */
export type RejectPrivateMatchEntry = {
  action: "reject-private-match-entry";
};

/** RejectPrivateMatchEntry zodスキーマ */
export const RejectPrivateMatchEntrySchema = z.object({
  action: z.literal("reject-private-match-entry"),
});

/**
 * 任意オブジェクトをRejectPrivateMatchEntryにパースする
 * パースできない場合はnullを返す
 * @param data パース元となるオブジェクト
 * @returns パース結果
 */
export function parseRejectPrivateMatchEntry(
  origin: unknown,
): RejectPrivateMatchEntry | null {
  const result = RejectPrivateMatchEntrySchema.safeParse(origin);
  return result.success ? result.data : null;
}
