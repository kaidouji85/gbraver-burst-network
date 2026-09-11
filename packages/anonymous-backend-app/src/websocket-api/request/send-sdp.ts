import { z } from "zod";

import {
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../../core/webrtc";

/** SDPを送信する */
export type SendSDP = {
  action: "send-sdp";
  /** シグナリングID */
  signalingID: string;
  /** SDP */
  sdp: RTCSessionDescriptionInit;
};

/** SendSDP zod スキーマ */
export const SendSDPSchema = z.object({
  action: z.literal("send-sdp"),
  signalingID: z.string(),
  sdp: RTCSessionDescriptionInitSchema,
});
