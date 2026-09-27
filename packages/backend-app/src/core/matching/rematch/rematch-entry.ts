import { BattleEntry, BattleEntrySchema } from "../battle-entry";
import { RematchRoomID, RematchRoomIDSchema } from "./rematch-room";

/** 再戦エントリ */
export type RematchEntry = BattleEntry & {
  /** ルームID */
  roomID: RematchRoomID;
};

/** RematchEntry zodスキーマ */
export const RematchEntrySchema = BattleEntrySchema.extend({
  roomID: RematchRoomIDSchema,
});
