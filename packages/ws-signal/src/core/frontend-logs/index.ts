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
export type FrontEndLog =
  ICECandidateStart | ICECandidateEnd | SignalingStart | SignalingEnd;

/** FrontendLog zodスキーマ */
export const FrontEndLogSchema = z.union([
  ICECandidateStartSchema,
  ICECandidateEndSchema,
  SignalingStartSchema,
  SignalingEndSchema,
]);
