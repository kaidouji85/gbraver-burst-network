import { z } from "zod";

import {
  RematchRoomID,
  RematchRoomIDSchema,
} from "../core/matching/rematch/rematch-room";

/** 再戦 マッチメークポーリング */
export type RematchMakePolling = {
  action: "rematch-make-polling";
  /** ルームID */
  roomID: RematchRoomID;
};

/** RematchMakePolling zodスキーマ */
export const RematchMakePollingSchema = z.object({
  action: z.literal("rematch-make-polling"),
  roomID: RematchRoomIDSchema,
});
