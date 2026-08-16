import { z } from "zod";

/** 選択されたICE Candidateの概要の最大長 */
export const MAX_SUMMARY_LENGTH = 256;

/** 選択されたICE Candidateの概要 */
export type SelectedIceCandidateSummary = {
  type: "SELECTED_ICE_CANDIDATE_SUMMARY";
  /** ICE Candidate概要 */
  summary: string;
};

/** SelectedIceCandidateSummary zodスキーマ */
export const SelectedIceCandidateSummarySchema = z.object({
  type: z.literal("SELECTED_ICE_CANDIDATE_SUMMARY"),
  summary: z.string().max(MAX_SUMMARY_LENGTH),
});
