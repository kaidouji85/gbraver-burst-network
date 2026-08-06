import { z } from "zod";

/** ログ：ICE候補送信開始 */
export type ICECandidateStart = {
  type: "ICE_CANDIDATE_START";
  /** スパンID */
  spanId: string;
};

/** ICECandidateStart zodスキーマ */
export const ICECandidateStartSchema = z.object({
  type: z.literal("ICE_CANDIDATE_START"),
  spanId: z.string(),
});

/** ログ：ICE候補送信終了 */
export type ICECandidateEnd = {
  type: "ICE_CANDIDATE_END";
  /** スパンID */
  spanId: string;
};

/** ICECandidateEnd zodスキーマ */
export const ICECandidateEndSchema = z.object({
  type: z.literal("ICE_CANDIDATE_END"),
  spanId: z.string(),
});
