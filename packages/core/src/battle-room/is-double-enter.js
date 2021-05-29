// @flow

import type {PlayerCommand} from "gbraver-burst-core";
import type {PlayerId} from "gbraver-burst-core/lib/player/player";

/**
 * 同一ユーザの二重コマンド入力であるかを判定する
 *
 * @param roomCommands ルームの全コマンド
 * @param playerId プレイヤーID
 * @return 判定結果、trueで二重入力である
 */
export function isDoubleEnter(roomCommands: PlayerCommand[], playerId: PlayerId): boolean {
  return roomCommands.map(v => v.playerId)
    .includes(playerId)
}