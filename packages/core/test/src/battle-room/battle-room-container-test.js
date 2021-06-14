// @flow

import test from 'ava';
import {EMPTY_PLAYER} from 'gbraver-burst-core';
import { BattleRoom } from '../../../src/battle-room/battle-room';
import { BattleRoomContainer } from '../../../src/battle-room/battle-room-container';

const player1 = {
  sessionID: 'session1',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player1'
  }
};

const player2 = {
  sessionID: 'session2',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player2'
  }
};

const player3 = {
  sessionID: 'session3',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player3'
  }
};

const player4 = {
  sessionID: 'session4',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player4'
  }
};

const room1 = new BattleRoom([player1, player2]);
const room2 = new BattleRoom([player3, player4]);

test('バトルルームコンテナ生成直後はルームが登録されていない', t => {
  const contaier = new BattleRoomContainer();
  
  const result = contaier.battleRooms();
  const expected = [];
  t.deepEqual(result, expected);
});

test('バトルルームを正しく追加することができる', t => {
  const contaier = new BattleRoomContainer();
  const id1 = contaier.add(room1);
  const id2 = contaier.add(room2);
  
  const result = contaier.battleRooms();
  const expected = [{id: id1, battleRoom: room1}, {id: id2, battleRoom: room2}];
  t.deepEqual(result, expected);
});

test('バトルルームを正しく削除することができる', t => {
  const contaier = new BattleRoomContainer();
  const id1 = contaier.add(room1);
  const id2 = contaier.add(room2);
  contaier.remove(id1);
  
  const result = contaier.battleRooms();
  const expected = [{id: id2, battleRoom: room2}];
  t.deepEqual(result, expected);
});