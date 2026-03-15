import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../core/webrtc";

/** ゲストのシグナルを送信 */
export type SendGuestSignal = {
  action: "send-guest-signal";
  /** ルームID */
  roomID: string;
  /** 予約ID */
  reservationID: string;
  /** ゲストのSDP */
  sdp: RTCSessionDescriptionInit;
  /** ゲストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};

/** SendGuestSignal zod スキーマ */
export const SendGuestSignalSchema = z.object({
  action: z.literal("send-guest-signal"),
  roomID: z.string(),
  reservationID: z.string(),
  sdp: RTCSessionDescriptionInitSchema,
  iceCandidates: z.array(RTCIceCandidateInitSchema),
});
