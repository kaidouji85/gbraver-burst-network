import { z } from "zod";

import {
  ICECandidateError,
  ICECandidateErrorSchema,
} from "./ice-candidate-error";
import {
  SelectedIceCandidateSummary,
  SelectedIceCandidateSummarySchema,
} from "./selected-ice-candidate-summary";
import {
  SignalingEnd,
  SignalingEndSchema,
  SignalingStart,
  SignalingStartSchema,
} from "./signaling";

/** フロントエンドログ */
export type FrontendLog =
  | SelectedIceCandidateSummary
  | ICECandidateError
  | SignalingStart
  | SignalingEnd;

/** FrontendLog zodスキーマ */
export const FrontendLogSchema = z.union([
  SelectedIceCandidateSummarySchema,
  ICECandidateErrorSchema,
  SignalingStartSchema,
  SignalingEndSchema,
]);
