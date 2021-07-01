// @flow

import type {BattleRoomID} from '@gbraver-burst-network/core';

/**
 * カジュアルマッチ 待合室 socket.ioルーム名
 * 
 * @return ルーム名 
 */
export function ioWaitingRoom(): string {
  return 'WAITING_ROOM';
}

/**
 * バトルルーム socket.ioルーム名
 * @param battleRoomID バトルルームID
 * @return ルーム名
 */
export function ioBattleRoom(battleRoomID: BattleRoomID): string {
  return `BATTLE_ROOM_OF_${battleRoomID}`;
}