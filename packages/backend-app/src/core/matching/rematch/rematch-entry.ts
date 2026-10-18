import { z } from "zod";

import { BattleEntry, BattleEntrySchema } from "../battle-entry";
import { RematchRoomID, RematchRoomIDSchema } from "./rematch-room";

/** 再戦エントリ */
export type RematchEntry = BattleEntry & {
  /** ルームID */
  roomID: RematchRoomID;
  /** トークンの有効期限（Unix秒） */
  expiresAt: number;
};

/** RematchEntry zodスキーマ */
export const RematchEntrySchema = BattleEntrySchema.extend({
  roomID: RematchRoomIDSchema,
  expiresAt: z.number(),
});
