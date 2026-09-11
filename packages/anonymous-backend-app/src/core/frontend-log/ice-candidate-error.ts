import { z } from "zod";

import { SpanIdContainer, SpanIdContainerSchema } from "./span-id";

/** ログ：ICE候補送信エラー */
const MAX_ERROR_LENGTH = 256;

/** ログ：ICE候補送信エラー */
export type ICECandidateError = SpanIdContainer & {
  type: "ICE_CANDIDATE_ERROR";
  /** エラー内容 */
  error: string;
};

/** ICECandidateError zodスキーマ */
export const ICECandidateErrorSchema = SpanIdContainerSchema.extend({
  type: z.literal("ICE_CANDIDATE_ERROR"),
  error: z.string().max(MAX_ERROR_LENGTH),
});
