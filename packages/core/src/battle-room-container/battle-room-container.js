// @flow

import type {RoomPlayer} from '../battle-room/battle-room';
import {BattleRoom} from '../battle-room/battle-room';
import {v4 as uuidv4} from 'uuid';

/** バトルルームID */
export type BattleRoomID = string;

/** バトルルーム生成 */
export interface BattleRoomCreator {
  /**
   * バトルルームを生成する
   * 
   * @param players バトルルームに入出するプレイヤー
   * @return 生成したバトルルームのID 
   */
  create(players: [RoomPlayer, RoomPlayer]): BattleRoomID;
}

/** バトルルーム検索 */
export interface BattleRoomFinder {
  /**
   * ID指定でバトルルームを検索する
   * 見つからない場合はnullを返す
   * 
   * @param id バトルルームID
   * @return 検索結果
   */
  find(id: BattleRoomID): ?BattleRoom;
}

/** バトルルームコンテナ */
export class BattleRoomContainer implements BattleRoomCreator, BattleRoomFinder {
  _battleRooms: {id: BattleRoomID, battleRoom: BattleRoom}[];

  /**
   * コンストラクタ
   */
  constructor() {
    this._battleRooms = [];
  }

  /**
   * バトルルームを生成する
   * 
   * @param players バトルルームに入出するプレイヤー
   * @return 生成したバトルルームのID 
   */
  create(players: [RoomPlayer, RoomPlayer]): BattleRoomID {
    const battleRoom = new BattleRoom(players);
    const id = uuidv4();
    this._battleRooms.push({id, battleRoom});
    return id;
  }

  /**
   * ID指定でバトルルームを検索する
   * 見つからない場合はnullを返す
   * 
   * @param id バトルルームID
   * @return 検索結果
   */
  find(id: BattleRoomID): ?BattleRoom {
    return this._battleRooms.find(v => v.id === id)
      ?.battleRoom ?? null;
  }
}