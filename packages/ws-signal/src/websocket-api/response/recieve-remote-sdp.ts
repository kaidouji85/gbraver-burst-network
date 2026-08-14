import { z } from "zod";

import {
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../../core/webrtc";

/** 相手からSDPを受信した */
export type ReceiveRemoteSDP = {
  type: "receive-remote-sdp";
  /** シグナリングID */
  signalingID: string;
  /** SDP */
  sdp: RTCSessionDescriptionInit;
};

/** ReceiveRemoteSDP zod スキーマ */
export const ReceiveRemoteSDPSchema = z.object({
  type: z.literal("receive-remote-sdp"),
  signalingID: z.string(),
  sdp: RTCSessionDescriptionInitSchema,
});
