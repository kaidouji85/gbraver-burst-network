// @flow

import {ArmDozers, Pilots} from 'gbraver-burst-core';
import type {Player} from 'gbraver-burst-core';
import type {Entry} from '../waiting-room/entry';
import type {RoomPlayer} from './battle-room';
import {v4 as uuidv4} from 'uuid';

/**
 * ルームプレイヤーをEtnryから生成する
 * 
 * @param entry エントリ
 * @return 生成結果
 */
export function createRoomPlayer(entry: Entry): RoomPlayer {
  const armdozer = ArmDozers.find(v => v.id === entry.armdozerId);
  const pilot = Pilots.find(v => v.id === entry.pilotId);
  if (!armdozer || !pilot) {
    throw new Error('not found armdozer or pilot');
  }

  const playerId = uuidv4();
  const player: Player = {playerId, armdozer, pilot};
  const userID = entry.userID;
  return {userID, player};
}