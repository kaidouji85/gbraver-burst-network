// @flow

import type {PlayerCommand} from "gbraver-burst-core";

/**
 * 相手の入力待ちか否かを判定する
 *
 * @param roomCommands ルームの全コマンド入力
 * @return 判定結果、trueで相手の入力待ち
 */
export function isWaiting(roomCommands: PlayerCommand[]): boolean {
  return roomCommands.length <= 1;
}