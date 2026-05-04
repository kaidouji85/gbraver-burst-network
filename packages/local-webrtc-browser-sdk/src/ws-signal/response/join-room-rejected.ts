import { z } from "zod";

/** 入室が拒否された */
export type JoinRoomRejected = {
  type: "join-room-rejected";
};

/** JoinRoomRejected zod スキーマ */
export const JoinRoomRejectedSchema = z.object({
  type: z.literal("join-room-rejected"),
});
