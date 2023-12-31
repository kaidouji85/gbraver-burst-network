import { GameState, restoreGBraverBurst } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { Battle, BattlePlayer } from "./battle";
import { BattleCommand } from "./battle-command";
import { Connection } from "./connection";
import { createPlayerCommands } from "./create-player-commands";
import { createPlayers } from "./create-players";

/** 戦闘進行結果 */
export type BattleProgressResult = BattleContinue | BattleEnd;

/** 戦闘継続 */
export type BattleContinue = {
  isGameEnd: false;
  /** アップデートされたステートヒストリー */
  update: GameState[];
  /** 更新されたバトル情報 */
  battle: Battle<BattlePlayer>;
};

/** 戦闘終了 */
export type BattleEnd = {
  isGameEnd: true;
  /** アップデートされたステートヒストリー */
  update: GameState[];
  /** 戦闘後のコネクションステート */
  connections: Connection[];
};

/**
 * 戦闘を進行する
 * @param battle 戦闘情報
 * @param commands ゲームに参加しているプレイヤーのコマンド
 * @return 戦闘進行結果、進行できない場合はnullを返す
 */
export function progressBattle(
  battle: Battle<BattlePlayer>,
  commands: [BattleCommand, BattleCommand],
): BattleProgressResult | null {
  const corePlayers = createPlayers(battle);
  const coreCommands = createPlayerCommands(battle, commands);
  if (!coreCommands) {
    return null;
  }

  const core = restoreGBraverBurst({
    players: corePlayers,
    stateHistory: battle.stateHistory,
  });
  const update = core.progress(coreCommands);
  const stateHistory = core.stateHistory();
  const lastState = update.at(-1);
  const isGameEnd = lastState?.effect.name === "GameEnd";
  if (isGameEnd) {
    const connections: Connection[] = battle.players.map((v) => ({
      connectionId: v.connectionId,
      userID: v.userID,
      state: {
        type: "None",
      },
    }));
    return {
      isGameEnd: true,
      update: stateHistory,
      connections,
    };
  }

  const flowID = uuidv4();
  const updatedBattle: Battle<BattlePlayer> = {
    ...battle,
    flowID,
    stateHistory,
  };
  return { isGameEnd, update, battle: updatedBattle };
}
