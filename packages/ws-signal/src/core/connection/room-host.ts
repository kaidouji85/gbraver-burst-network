import { z } from "zod";

/** ルームのホスト */
export type RoomHost = {
  type: "RoomHost";
  /** ホストしているルームID */
  roomID: string;
};

/** RoomHost zodスキーマ */
export const RoomHostSchema = z.object({
  type: z.literal("RoomHost"),
  roomID: z.string(),
});
