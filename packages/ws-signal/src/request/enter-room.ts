import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../core/web-rtc";

/** ゲストが入室する */
export type EnterRoom = {
  action: "enter-room";
  /** ルームID */
  roomId: string;
  /** クライアントのSDP */
  sdp: RTCSessionDescriptionInit;
  /** クライアントのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};

/** EnterRoom zod スキーマ */
export const EnterRoomSchema = z.object({
  action: z.literal("enter-room"),
  roomId: z.string(),
  sdp: RTCSessionDescriptionInitSchema,
  iceCandidates: z.array(RTCIceCandidateInitSchema),
});
