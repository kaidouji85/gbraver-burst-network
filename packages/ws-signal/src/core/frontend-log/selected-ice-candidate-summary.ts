import { z } from "zod";

import { SpanIdContainer, SpanIdContainerSchema } from "./span-id";

/** 選択されたICE Candidateの概要の最大長 */
export const MAX_SUMMARY_LENGTH = 256;

/** 選択されたICE Candidateの概要 */
export type SelectedIceCandidateSummary = SpanIdContainer & {
  type: "SELECTED_ICE_CANDIDATE_SUMMARY";
  /** スパンID */
  spanId: string;
  /** ICE Candidate概要 */
  summary: string;
};

/** SelectedIceCandidateSummary zodスキーマ */
export const SelectedIceCandidateSummarySchema = SpanIdContainerSchema.extend({
  type: z.literal("SELECTED_ICE_CANDIDATE_SUMMARY"),
  summary: z.string().max(MAX_SUMMARY_LENGTH),
});
