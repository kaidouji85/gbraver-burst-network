// @flow

import {EMPTY_PLAYER} from "gbraver-burst-core";
import type {RoomPlayer} from "../../src/battle-room/battle-room";

/** 空のルームプレイヤー */
export const EMPTY_ROOM_PLAYER: RoomPlayer = {
  /** ユーザID */
  userID: 'emptyUser',
  /** ユーザのプレイヤー情報 */
  player: EMPTY_PLAYER,
};