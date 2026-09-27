import { Battle, BattlePlayer } from "../../battle/battle";
import { createBattle } from "../../battle/create-battle";
import { Connection } from "../../connection/connection";
import { createBattlePlayer } from "../create-battle-player";
import { Rematching } from "./rematch-make";

export type RematchResponse = {
  /** 新しく作成されたバトル情報 */
  battle: Battle<BattlePlayer>;
  /** バトル参加者コネクション更新結果をあつめたもの */
  connections: Connection[];
};

export const startRematch = (matching: Rematching) => {
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
};
