import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../core/webrtc";

/** ゲストが入室する */
export type JoinRoom = {
  action: "join-room";
  /** ルームID */
  roomID: string;
  /** クライアントのSDP */
  sdp: RTCSessionDescriptionInit;
  /** クライアントのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};

/** JoinRoom zod スキーマ */
export const JoinRoomSchema = z.object({
  action: z.literal("join-room"),
  roomID: z.string(),
  sdp: RTCSessionDescriptionInitSchema,
  iceCandidates: z.array(RTCIceCandidateInitSchema),
});
