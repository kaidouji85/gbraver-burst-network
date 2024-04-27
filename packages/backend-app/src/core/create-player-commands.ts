import { PlayerCommand } from "gbraver-burst-core";

import { Battle, BattlePlayer } from "./battle";
import { BattleCommand } from "./battle-command";

/**
 * Gブレイバーバーストコアのコマンドを生成する
 * @param battle バトル情報
 * @param command バトルコマンド
 * @returns 生成結果、生成できない場合はnullを返す
 */
function createPlayerCommand(
  battle: Battle<BattlePlayer>,
  command: BattleCommand,
): PlayerCommand | null {
  const foundPlayer = battle.players.find((v) => v.userID === command.userID);
  return foundPlayer
    ? {
        command: command.command,
        playerId: foundPlayer.playerId,
      }
    : null;
}

/**
 * Gブレイバーバースコアに渡すための、全プレイヤーのコマンドを生成する
 * @param battle バトル情報
 * @param commands すべてのプレイヤーのバトルコマンド
 * @returns 生成結果、生成できない場合はnullを返す
 */
export function createPlayerCommands(
  battle: Battle<BattlePlayer>,
  commands: [BattleCommand, BattleCommand],
): [PlayerCommand, PlayerCommand] | null {
  const coreCommand0 = createPlayerCommand(battle, commands[0]);
  const coreCommand1 = createPlayerCommand(battle, commands[1]);
  return coreCommand0 && coreCommand1 ? [coreCommand0, coreCommand1] : null;
}
