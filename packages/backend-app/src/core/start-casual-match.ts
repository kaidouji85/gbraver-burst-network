import { Battle, BattlePlayer } from "./battle";
import { CasualMatchEntry } from "./casual-match-entry";
import { CasualMatching } from "./casual-match-make";
import { Connection } from "./connection";
import { createBattle } from "./create-battle";
import { createBattlePlayer } from "./create-battle-player";

/** カジュアルマッチ開始情報 */
type MatchStartResponse = {
  /** バトル情報 */
  battle: Battle<BattlePlayer>;
  /** バトル参加者のコネクション */
  connections: Connection[];
}

/**
 * カジュアルマッチを開始する
 * @param matching マッチング
 * @return バトルとコネクションのリスト
 */
export function startCasualMatch<X extends CasualMatchEntry> (
  matching: CasualMatching<X>,
): MatchStartResponse {
  const battle = createBattle([
    createBattlePlayer(matching[0]),
    createBattlePlayer(matching[1]),
  ]);
  const connections: Connection[] = matching.map((v) => ({
    connectionId: v.connectionId,
    userID: v.userID,
    state: {
      type: "InBattle",
      battleID: battle.battleID,
      players: battle.players,
    },
  }));
  return { battle, connections };
}