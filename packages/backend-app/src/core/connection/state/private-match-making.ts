import { z } from "zod";

import {
  PrivateMatchRoomID,
  PrivateMatchRoomIDSchema,
} from "../../matching/private-match/private-match-room";

/** プライベートマッチメイク中 */
export type PrivateMatchMaking = {
  type: "PrivateMatchMaking";
  /** ルームID */
  roomID: PrivateMatchRoomID;
};

/** PrivateMatchMaking zodスキーマ */
export const PrivateMatchMakingSchema = z.object({
  type: z.literal("PrivateMatchMaking"),
  roomID: PrivateMatchRoomIDSchema,
});
