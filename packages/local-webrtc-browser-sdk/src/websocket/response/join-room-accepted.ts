import { z } from "zod";

import { RTCIceCandidateInitSchema } from "../../webrtc/rtc-ice-candidate-init-schema";
import { RTCSessionDescriptionInitSchema } from "../../webrtc/rtc-session-description-init-schema";

/** ルーム参加承認 */
export type JoinRoomAccepted = {
  type: "join-room-accepted";
  /** 予約ID */
  reservationID: string;
  /** ホストのSDP */
  sdp: RTCSessionDescriptionInit;
  /** ホストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};

/** JoinRoomAccepted zod スキーマ */
export const JoinRoomAcceptedSchema = z.object({
  type: z.literal("join-room-accepted"),
  reservationID: z.string(),
  sdp: RTCSessionDescriptionInitSchema,
  iceCandidates: z.array(RTCIceCandidateInitSchema),
});
