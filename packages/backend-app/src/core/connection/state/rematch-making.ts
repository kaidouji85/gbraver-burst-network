import { z } from "zod";

import {
  RematchRoomID,
  RematchRoomIDSchema,
} from "../../matching/rematch/rematch-room";

/** 再戦マッチング中 */
export type RematchMaking = {
  type: "RematchMaking";
  /** 再戦ルームID */
  roomID: RematchRoomID;
};

/** RematchMaking zod スキーマ */
export const RematchMakingSchema = z.object({
  type: z.literal("RematchMaking"),
  roomID: RematchRoomIDSchema,
});
