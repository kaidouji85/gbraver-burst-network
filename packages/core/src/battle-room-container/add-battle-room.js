// @flow

import {BattleRoom} from '../battle-room/battle-room';
import type {IDRoomPair, BattleRoomID} from './id-room-pair';
import {v4 as uuidv4} from 'uuid';

/** バトルルーム追加結果 */
export type AddBattleRoomResult = {
  /** 発行したバトルルームID */
  issuedID: BattleRoomID,
  /** 追加後のコンテナ内バトルルーム */
  updatedBattleRooms: IDRoomPair[],
};

/**
 * バトルルームを追加する
 * 
 * @param battleRooms コンテナ内の全バトルルーム
 * @param battleRoom 追加するバトルルーム
 * @return 追加結果
 */
export function addBattleRoom(battleRooms: IDRoomPair[], battleRoom: BattleRoom): AddBattleRoomResult {
  const id = uuidv4();
  const newBattleRoom = {id, battleRoom};
  const updatedBattleRooms = [...battleRooms, newBattleRoom];
  return {issuedID: id, updatedBattleRooms};
}