// @flow

import type {RoomPlayer} from '../battle-room/battle-room';
import {BattleRoom} from '../battle-room/battle-room';
import {v4 as uuidv4} from 'uuid';

export type BattleRoomID = string;

export interface BattleRoomCreator {
  create(players: [RoomPlayer, RoomPlayer]): BattleRoomID;
}

export interface BattleRoomFinder {
  find(id: BattleRoomID): ?BattleRoom;
}

export class BattleRoomContainer implements BattleRoomCreator, BattleRoomFinder {

  _battleRooms: {id: BattleRoomID, battleRoom: BattleRoom}[];

  constructor() {
    this._battleRooms = [];
  }

  create(players: [RoomPlayer, RoomPlayer]): BattleRoomID {
    const battleRoom = new BattleRoom(players);
    const id = uuidv4();
    this._battleRooms = [...this._battleRooms, {id, battleRoom}];
    return id;
  }

  find(id: BattleRoomID): ?BattleRoom {
    return this._battleRooms.find(v => v.id === id)
      ?.battleRoom;
  }
}