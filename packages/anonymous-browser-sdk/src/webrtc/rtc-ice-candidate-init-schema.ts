import { z } from "zod";

/** RTCIceCandidateInit の zod スキーマ */
export const RTCIceCandidateInitSchema = z.object({
  candidate: z.string().optional(),
  sdpMLineIndex: z.number().nullable().optional(),
  sdpMid: z.string().nullable().optional(),
  usernameFragment: z.string().nullable().optional(),
});
