import { z } from "zod";

import {
  ICECandidateEnd,
  ICECandidateEndSchema,
  ICECandidateStart,
  ICECandidateStartSchema,
} from "./ice-candidate";
import {
  SignalingEnd,
  SignalingEndSchema,
  SignalingStart,
  SignalingStartSchema,
} from "./signaling";

/** フロントエンドログ */
export type FrontendLog =
  ICECandidateStart | ICECandidateEnd | SignalingStart | SignalingEnd;

/** FrontendLog zodスキーマ */
export const FrontendLogSchema = z.union([
  ICECandidateStartSchema,
  ICECandidateEndSchema,
  SignalingStartSchema,
  SignalingEndSchema,
]);
