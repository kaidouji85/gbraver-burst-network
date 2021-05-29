// @flow

import type {PlayerCommand} from "gbraver-burst-core";
import type {UserID} from "../user";
import type {RoomUser} from "./battle-room";

/**
 * 同一ユーザの二重コマンド入力であるかを判定する
 *
 * @param roomUsers ルームの全ユーザ
 * @param roomCommands ルームの全コマンド
 * @param userID コマンド入力ユーザ
 * @return 判定結果、trueで二重入力である
 */
export function isDoubleEnter(roomUsers: RoomUser[], roomCommands: PlayerCommand[], userID: UserID): boolean {
  return roomCommands
    .map(command => roomUsers.find(user => user.player.playerId === command.playerId))
    .includes(userID);
}