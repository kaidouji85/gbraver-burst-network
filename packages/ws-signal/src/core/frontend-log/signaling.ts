import { z } from "zod";

/** ログ：シグナリング開始 */
export type SignalingStart = {
  type: "SIGNALING_START";
  /** スパンID */
  spanId: string;
};

/** SignalingStart zodスキーマ */
export const SignalingStartSchema = z.object({
  type: z.literal("SIGNALING_START"),
  spanId: z.string(),
});

/** ログ：シグナリング終了 */
export type SignalingEnd = {
  type: "SIGNALING_END";
  /** スパンID */
  spanId: string;
};

/** SignalingEnd zodスキーマ */
export const SignalingEndSchema = z.object({
  type: z.literal("SIGNALING_END"),
  spanId: z.string(),
});
