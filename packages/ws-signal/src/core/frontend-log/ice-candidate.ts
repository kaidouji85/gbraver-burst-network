import { z } from "zod";

import { SpanIdContainer, SpanIdContainerSchema } from "./span-id";

/** ログ：ICE候補送信開始 */
export type ICECandidateStart = SpanIdContainer & {
  type: "ICE_CANDIDATE_START";
};

/** ICECandidateStart zodスキーマ */
export const ICECandidateStartSchema = SpanIdContainerSchema.extend({
  type: z.literal("ICE_CANDIDATE_START"),
});

/** ログ：ICE候補送信終了 */
export type ICECandidateEnd = SpanIdContainer & {
  type: "ICE_CANDIDATE_END";
};

/** ICECandidateEnd zodスキーマ */
export const ICECandidateEndSchema = SpanIdContainerSchema.extend({
  type: z.literal("ICE_CANDIDATE_END"),
});
