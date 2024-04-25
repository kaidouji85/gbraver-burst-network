import { z } from "zod";

/** オーナーがプライベートマッチングできなかった */
export type CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making";
};

/** CouldNotPrivateMatchMaking zodスキーマ */
export const CouldNotPrivateMatchMakingSchema = z.object({
  action: z.literal("cloud-not-private-match-making"),
});

/**
 * 任意オブジェクトをCouldNotPrivateMatchMakingにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @returns パース結果
 */
export function parseCouldNotPrivateMatchMaking(
  origin: unknown,
): CouldNotPrivateMatchMaking | null {
  const result = CouldNotPrivateMatchMakingSchema.safeParse(origin);
  return result.success ? result.data : null;
}
