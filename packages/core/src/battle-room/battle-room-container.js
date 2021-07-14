// @flow

import {BattleRoom} from './battle-room';
import {v4 as uuidv4} from 'uuid';
import type {UserID} from "../user";

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
   * バトルルームを追加する
   * その際に、ルームIDも発行する
   *
   * @param battleRoom 追加するバトルルーム
   * @return 追加したバトルルームと発行したIDのペア
   */
  add(battleRoom: BattleRoom): IDRoomPair;
}

/** ID指定でバトルルームを検索する */
export interface BattleRoomFind {
  /**
   * ID指定でバトルルームを検索する
   * 条件に一致するバトルルームが存在しない場合、nullを返す
   * 
   * @param id 検索するバトルルームのID
   * @return 検索結果 
   */
  find(id: BattleRoomID): ?IDRoomPair;
}

/** ユーザID指定でバトルルームを検索する */
export interface BattleRoomFindByUserID {
  /**
   * ユーザID指定でバトルルームを検索する
   * 条件に一致するバトルルームが存在しない場合、nullを返す
   * 
   * @param userID ユーザID
   * @return 検索結果
   */
  findByUserID(userID: UserID): ?IDRoomPair;
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
export class BattleRoomContainer implements BattleRoomAdd, BattleRoomFind, BattleRoomFindByUserID, BattleRoomRemove {
  _battleRooms: IDRoomPair[];

  /**
   * コンストラクタ
   */
  constructor() {
    this._battleRooms = [];
  }

  /**
   * 登録されている全バトルルームを取得する
   *
   * @return 取得結果
   */
  battleRooms(): IDRoomPair[] {
    return this._battleRooms;
  }

  /** @override */
  add(battleRoom: BattleRoom): IDRoomPair {
    const id = uuidv4();
    const newRoom = {id, battleRoom};
    this._battleRooms = [...this._battleRooms, newRoom];
    return newRoom;
  }

  /** @override */
  find(id: BattleRoomID): ?IDRoomPair {
    return this._battleRooms.find(v => v.id === id) ?? null;
  }

  /** @override */
  findByUserID(userID: UserID): ?IDRoomPair {
    return this._battleRooms.find(v =>
      v.battleRoom.roomPlayers()
        .map(p => p.userID)
        .includes(userID)
    ) ?? null;
  }

  /** @override */
  remove(id: BattleRoomID): void {
    this._battleRooms = this._battleRooms.filter(v => v.id !== id);
  }
}