// @flow

import type {PlayerCommand, PlayerId} from "gbraver-burst-core";

/**
 * 同一ユーザの二重コマンド入力であるかを判定する
 *
 * @param roomCommands ルームの全コマンド
 * @param playerId プレイヤーID
 * @return 判定結果、trueで二重入力である
 */
export function isDoubleEnterCommand(roomCommands: PlayerCommand[], playerId: PlayerId): boolean {
  return roomCommands.map(v => v.playerId)
    .includes(playerId)
}