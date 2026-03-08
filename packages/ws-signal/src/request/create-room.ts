import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
  RTCSessionDescriptionInit,
  RTCSessionDescriptionInitSchema,
} from "../core/web-rtc";

/** ホストがルームを作成する */
export type CreateRoom = {
  action: "create-room";
  /** ホストのSDP */
  sdp: RTCSessionDescriptionInit;
  /** ホストのICE候補 */
  iceCandidates: RTCIceCandidateInit[];
};

/** CreateRoomのzodスキーマ */
export const CreateRoomSchema = z.object({
  action: z.literal("create-room"),
  sdp: RTCSessionDescriptionInitSchema,
  iceCandidates: z.array(RTCIceCandidateInitSchema),
});
