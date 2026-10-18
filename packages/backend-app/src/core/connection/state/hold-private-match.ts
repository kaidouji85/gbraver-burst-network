import { z } from "zod";

import {
  PrivateMatchRoomID,
  PrivateMatchRoomIDSchema,
} from "../../matching/private-match/private-match-room";

/** プライベートマッチ開催 */
export type HoldPrivateMatch = {
  type: "HoldPrivateMatch";
  /** 作成したルームのID */
  roomID: PrivateMatchRoomID;
};

/** HoldPrivateMatch zodスキーマ */
export const HoldPrivateMatchSchema = z.object({
  type: z.literal("HoldPrivateMatch"),
  roomID: PrivateMatchRoomIDSchema,
});
