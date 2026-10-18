import { BattleEntry } from "../battle-entry";
import { RematchEntry } from "./rematch-entry";
import { RematchRoom } from "./rematch-room";

/** マッチング結果 */
export type Rematching = [BattleEntry, BattleEntry];

/**
 * 再戦のマッチメイクを行う
 * マッチメイクできなかった場合はnullを返す
 * @param room ルーム
 * @param entries エントリ
 * @returns マッチメイク結果
 */
export function rematchMake(
  room: RematchRoom,
  entries: RematchEntry[],
): Rematching | null {
  if (entries.length < 2) {
    return null;
  }

  const hostEntry = entries.find((e) => e.userID === room.hostUserID);
  const guestEntry = entries.find((e) => e.userID !== room.hostUserID);
  if (!hostEntry || !guestEntry) {
    return null;
  }

  return [hostEntry, guestEntry];
}
