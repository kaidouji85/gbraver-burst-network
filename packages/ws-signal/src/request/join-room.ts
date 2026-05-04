import { z } from "zod";

/** ゲストが入室する */
export type JoinRoom = {
  action: "join-room";
  /** ルームID */
  roomID: string;
};

/** JoinRoom zod スキーマ */
export const JoinRoomSchema = z.object({
  action: z.literal("join-room"),
  roomID: z.string(),
});
