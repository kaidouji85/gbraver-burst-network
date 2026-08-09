import { z } from "zod";

import { SpanIdContainer, SpanIdContainerSchema } from "./span-id";

/** ログ：シグナリング開始 */
export type SignalingStart = SpanIdContainer & {
  type: "SIGNALING_START";
};

/** SignalingStart zodスキーマ */
export const SignalingStartSchema = SpanIdContainerSchema.extend({
  type: z.literal("SIGNALING_START"),
});

/** ログ：シグナリング終了 */
export type SignalingEnd = SpanIdContainer & {
  type: "SIGNALING_END";
};

/** SignalingEnd zodスキーマ */
export const SignalingEndSchema = SpanIdContainerSchema.extend({
  type: z.literal("SIGNALING_END"),
});
