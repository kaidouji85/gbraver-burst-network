import { z } from "zod";

/** ルームのホスト */
export type RoomHost = {
  type: "room-host";
  /** ホストしているルームID */
  roomID: string;
};

/** RoomHost zodスキーマ */
export const RoomHostSchema = z.object({
  type: z.literal("room-host"),
  roomID: z.string(),
});
