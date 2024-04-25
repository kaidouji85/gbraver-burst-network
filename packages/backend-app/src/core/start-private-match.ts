import { Battle, BattlePlayer } from "./battle";
import { Connection } from "./connection";
import { createBattle } from "./create-battle";
import { createBattlePlayer } from "./create-battle-player";
import { notChosenPrivateMatchEntries } from "./not-chosen-private-match-entries";
import { PrivateMatchEntry } from "./private-match-entry";
import { PrivateMatching } from "./private-match-make";

/** プライベートマッチ開始情報 */
type MatchStartResponse = {
  /** バトル情報 */
  battle: Battle<BattlePlayer>;
  /** バトル参加者のコネクション */
  battleConnections: Connection[];
  /** マッチングしなかったプレイヤーのコネクション */
  notChosenConnections: Connection[];
};

/**
 * プライベートマッチを開始する
 * @param entries 指定したルームのすべてのエントリ
 * @param matching マッチング結果
 * @returns プライベートマッチ開始情報
 */
export function startPrivateMatch(
  entries: PrivateMatchEntry[],
  matching: PrivateMatching,
): MatchStartResponse {
  const battle = createBattle([
    createBattlePlayer(matching[0]),
    createBattlePlayer(matching[1]),
  ]);
  const battleConnections: Connection[] = matching.map((v) => ({
    connectionId: v.connectionId,
    userID: v.userID,
    state: {
      type: "InBattle",
      battleID: battle.battleID,
      players: battle.players,
    },
  }));
  const notChosenEntries = notChosenPrivateMatchEntries(matching, entries);
  const notChosenConnections: Connection[] = notChosenEntries.map((v) => ({
    connectionId: v.connectionId,
    userID: v.userID,
    state: {
      type: "None",
    },
  }));
  return { battle, battleConnections, notChosenConnections };
}
