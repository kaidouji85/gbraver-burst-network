import { GameState, restoreGBraverBurst } from "gbraver-burst-core";

import { Battle, BattlePlayer } from "./battle";
import { BattleCommand } from "./battle-command";
import { createPlayerCommands } from "./create-player-commands";
import { createPlayers } from "./create-players";

/** 戦闘進行結果 */
type BattleProgressResult = {
  /** アップデートされたステートヒストリー */
  update: GameState[];
  /** 今までのステートヒストリー */
  stateHistory: GameState[];
  /** ゲームが終了したか否か、trueで終了した */
  isGameEnd: boolean;
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
  return { update, stateHistory, isGameEnd };
}
