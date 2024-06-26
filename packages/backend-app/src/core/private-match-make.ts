import { BattleEntry } from "./battle-entry";
import { PrivateMatchEntry } from "./private-match-entry";
import { PrivateMatchRoom } from "./private-match-room";

/** マッチング結果 */
export type PrivateMatching = [BattleEntry, BattleEntry];

/**
 * プライベートマッチメイクを行う
 * マッチメイクできなかった場合はnullを返す
 * @param room ルーム
 * @param entries エントリ
 * @returns マッチメイク結果
 */
export function privateMatchMake(
  room: PrivateMatchRoom,
  entries: PrivateMatchEntry[],
): PrivateMatching | null {
  if (entries.length <= 0) {
    return null;
  }

  const ownerEntry: BattleEntry = {
    userID: room.owner,
    connectionId: room.ownerConnectionId,
    armdozerId: room.armdozerId,
    pilotId: room.pilotId,
  };
  const otherEntry = entries[0];
  return [ownerEntry, otherEntry];
}
