// @flow

import {BattleRoom} from './battle-room';
import {v4 as uuidv4} from 'uuid';
import type {SessionID} from '../session/session';

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
   * @return 発行したID
   */
  add(battleRoom: BattleRoom): BattleRoomID;
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

/** セッションID指定でバトルルームを検索する */
export interface BattleRoomFindBySessionID {
  /**
   * セッションID指定でバトルルームを検索する
   * 条件に一致するバトルルームが存在しない場合、nullを返す
   * 
   * @param sessionID セッションID
   * @return 検索結果
   */
  findBySessionID(sessionID: SessionID): ?IDRoomPair;
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
export class BattleRoomContainer implements BattleRoomAdd, BattleRoomFind, BattleRoomFindBySessionID, BattleRoomRemove {
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
    const newRoom = {id, battleRoom};
    this._battleRooms = [...this._battleRooms, newRoom];
    return id;
  }

  /**
   * 登録されている全バトルルームを取得する
   *
   * @return 取得結果
   */
  battleRooms(): IDRoomPair[] {
    return this._battleRooms;
  }

  /**
   * ID指定でバトルルームを検索する
   * 検索失敗した場合、nullを返す
   * 
   * @param id 検索するバトルルームのID
   * @return 検索結果 
   */
  find(id: BattleRoomID): ?IDRoomPair {
    return this._battleRooms.find(v => v.id === id) ?? null;
  }

  /**
   * セッションID指定でバトルルームを検索する
   * 条件に一致するバトルルームが存在しない場合、nullを返す
   * 
   * @param sessionID セッションID
   * @return 検索結果
   */
  findBySessionID(sessionID: SessionID): ?IDRoomPair {
    return this._battleRooms.find(v => v.battleRoom.roomPlayers()
      .map(p => p.sessionID)
      .includes(sessionID)
    ) ?? null;
  }

  /**
   * 指定したバトルルームをコンテナから削除する
   * 
   * @param id 削除するバトルルームのID
   */
  remove(id: BattleRoomID): void {
    this._battleRooms = this._battleRooms.filter(v => v.id !== id);
  }
}