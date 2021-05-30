// @flow

import type {RoomUser} from "../../src/battle-room/room-user";
import {EMPTY_PLAYER} from "gbraver-burst-core/lib/empty/player";

/** 空のルームユーザ */
export const EMPTY_ROOM_USER: RoomUser = {
  /** ユーザID */
  userID: '',
  /** ユーザのプレイヤー情報 */
  player: EMPTY_PLAYER,
};