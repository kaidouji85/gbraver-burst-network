import { Battle, BattleCommand } from "./battle";

/**
 * バトルのコマンドを更新する
 * @param options オプション
 * @param options.battle バトル情報
 * @param options.command 更新するコマンド
 * @returns 更新後のバトル情報
 */
export function updateCommand(options: {
  battle: Battle;
  command: BattleCommand;
}): Battle {
  const { battle, command } = options;
  const updatedCommands = new Map(battle.commands);
  updatedCommands.set(command.playerId, command);
  return { ...battle, commands: updatedCommands };
}
