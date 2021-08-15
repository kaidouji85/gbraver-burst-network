// @flow

import type {BattleRoomID} from "../../battle-room/battle-room-container";

/**
 * カジュアルマッチ 待合室 socket.ioルーム名
 * 
 * @return ルーム名 
 */
export function ioWaitingRoomName(): string {
  return 'WAITING_ROOM';
}

/**
 * バトルルーム socket.ioルーム名
 * @param battleRoomID バトルルームID
 * @return ルーム名
 */
export function ioBattleRoomName(battleRoomID: BattleRoomID): string {
  return `BATTLE_ROOM_OF_${battleRoomID}`;
}