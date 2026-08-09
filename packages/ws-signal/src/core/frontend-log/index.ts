import { z } from "zod";

import {
  ICECandidateEnd,
  ICECandidateEndSchema,
  ICECandidateStart,
  ICECandidateStartSchema,
} from "./ice-candidate";
import {
  ICECandidateError,
  ICECandidateErrorSchema,
} from "./ice-candidate-error";
import {
  SignalingEnd,
  SignalingEndSchema,
  SignalingStart,
  SignalingStartSchema,
} from "./signaling";

/** フロントエンドログ */
export type FrontendLog =
  | ICECandidateStart
  | ICECandidateEnd
  | ICECandidateError
  | SignalingStart
  | SignalingEnd;

/** FrontendLog zodスキーマ */
export const FrontendLogSchema = z.union([
  ICECandidateStartSchema,
  ICECandidateEndSchema,
  ICECandidateErrorSchema,
  SignalingStartSchema,
  SignalingEndSchema,
]);
