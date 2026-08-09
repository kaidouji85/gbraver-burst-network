import { z } from "zod";

import { RTCIceCandidateInitSchema } from "../../webrtc/rtc-ice-candidate-init-schema";
import { RTCSessionDescriptionInitSchema } from "../../webrtc/rtc-session-description-init-schema";

/** マッチング成功 */
export type Matching = {
  type: "matching";
  /** マッチング相手のSDP */
  sdp: RTCSessionDescriptionInit;
  /** マッチング相手のICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};

/** Matching zod スキーマ */
export const MatchingSchema = z.object({
  type: z.literal("matching"),
  sdp: RTCSessionDescriptionInitSchema,
  iceCandidates: z.array(RTCIceCandidateInitSchema),
});
