import { BattleEntry } from "./battle-entry";
import { PrivateMatchRoomID } from "./private-match-room";

/** プライベートマッチエントリ */
export type PrivateMatchEntry = BattleEntry & {
  /** エントリするルームID */
  roomID: PrivateMatchRoomID;
};
