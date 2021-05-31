// @flow

import type {PlayerCommand} from "gbraver-burst-core/lib/game/command/player-command";

/** コマンド抽出成功 */
type ExtractCommands = {
  /** 抽出したコマンド */
  commands: PlayerCommand[],
  // TODO タプルに置き換える
  /** ルームの全コマンド入力の更新結果 */
  roomCommands: PlayerCommand[],
};

/**
 * ゲーム進行に必要なコマンドを抽出する
 * コマンド抽出に失敗した場合はnullを返す
 *
 * @param roomCommands ルームの全コマンド入力
 * @return 抽出結果
 */
export function extractCommands(roomCommands: PlayerCommand[]): ?ExtractCommands {
  if (roomCommands.length <= 1) {
    return null;
  }

  const commands = roomCommands.slice(0, 2);
  const updatedRoomCommands = roomCommands.slice(2);
  return {commands: commands, roomCommands: updatedRoomCommands};
}