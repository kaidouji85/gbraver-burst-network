// @flow

import {BattleRoom} from './battle-room';
import {v4 as uuidv4} from 'uuid';

/** バトルルームID */
export type BattleRoomID = string;

/** バトルルームとIDのペア */
export type IDRoomPair = {
  id: BattleRoomID,
  battleRoom: BattleRoom
};

/** バトルルーム追加 */
export interface BattleRoomAdd {
  /**
   * バトルルームを追加して、IDを発行する
   * 
   * @param battleRoom 追加するバトルルーム
   * @return 発行したバトルルームID 
   */
  add(battleRoom: BattleRoom): BattleRoomID;
}

/** 登録されている全バトルルームを取得する */
export interface AllBattleRooms {
  /**
   * ID指定でバトルルームを検索する
   * 見つからない場合はnullを返す
   * 
   * @param id バトルルームID
   * @return 検索結果
   */
  battleRooms(): IDRoomPair[];
}

/** バトルルームをコンテナから削除する */
export interface BattleRoomRemove {
  /**
   * 指定したバトルルームをコンテナから削除する
   * 
   * @param id 削除するバトルルームのID
   */
  remove(id: BattleRoomID): void;
}

/** バトルルームコンテナ */
export class BattleRoomContainer implements BattleRoomAdd, AllBattleRooms, BattleRoomRemove {
  _battleRooms: IDRoomPair[];

  /**
   * コンストラクタ
   */
  constructor() {
    this._battleRooms = [];
  }

  /**
   * バトルルームを追加して、IDを発行する
   * 
   * @param battleRoom 追加するバトルルーム
   * @return 発行したバトルルームID 
   */
  add(battleRoom: BattleRoom): BattleRoomID {
    const id = uuidv4();
    this._battleRooms = [...this._battleRooms, {id, battleRoom}];
    return id;     
  }

  /**
   * ID指定でバトルルームを検索する
   * 見つからない場合はnullを返す
   * 
   * @param id バトルルームID
   * @return 検索結果
   */
  battleRooms(): IDRoomPair[] {
    return this._battleRooms;
  }

  /**
   * 指定したバトルルームをコンテナから削除する
   * 
   * @param id 削除するバトルルームのID
   */
  remove(id: BattleRoomID): void {
    const updated = this._battleRooms.filter(v => v.id !== id);
    this._battleRooms = updated;
  }
}