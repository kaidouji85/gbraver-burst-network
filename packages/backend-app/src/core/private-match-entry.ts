import { BattleEntry, BattleEntrySchema } from "./battle-entry";
import { PrivateMatchRoomID, PrivateMatchRoomIDSchema } from "./private-match-room";

/** プライベートマッチエントリ */
export type PrivateMatchEntry = BattleEntry & {
  /** エントリするルームID */
  roomID: PrivateMatchRoomID;
};

/** PrivateMatchEntry zodスキーマ */
export const PrivateMatchEntrySchema = BattleEntrySchema.extend({
  roomID: PrivateMatchRoomIDSchema,
});
