import { z } from "zod";

/** ホストがルームを作成する */
export type CreateRoom = {
  action: "create-room";
};

/** CreateRoomのzodスキーマ */
export const CreateRoomSchema = z.object({
  action: z.literal("create-room"),
});
