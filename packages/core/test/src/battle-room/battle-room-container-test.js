// @flow

import test from 'ava';
import {EMPTY_PLAYER} from 'gbraver-burst-core';
import {BattleRoom} from '../../../src/battle-room/battle-room';
import {BattleRoomContainer} from '../../../src/battle-room/battle-room-container';

const player1 = {
  userID: 'user1',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player1'
  }
};

const player2 = {
  userID: 'user2',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player2'
  }
};

const player3 = {
  userID: 'user3',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player3'
  }
};

const player4 = {
  userID: 'user4',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player4'
  }
};

const room1 = new BattleRoom([player1, player2]);
const room2 = new BattleRoom([player3, player4]);

test('バトルルームコンテナ生成直後はルームが登録されていない', t => {
  const container = new BattleRoomContainer();
  
  const result = container.battleRooms();
  const expected = [];
  t.deepEqual(result, expected);
});

test('バトルルームを正しく追加することができる', t => {
  const container = new BattleRoomContainer();
  const p1 = container.add(room1);
  const p2 = container.add(room2);
  
  const result = container.battleRooms();
  const expected = [{id: p1.id, battleRoom: room1}, {id: p2.id, battleRoom: room2}];
  t.deepEqual(result, expected);
});

test('バトルルームを正しく削除することができる', t => {
  const container = new BattleRoomContainer();
  const p1 = container.add(room1);
  const p2 = container.add(room2);
  container.remove(p1.id);
  
  const result = container.battleRooms();
  const expected = [{id: p2.id, battleRoom: room2}];
  t.deepEqual(result, expected);
});

test('バトルルームID指定で検索することができる', t => {
  const container = new BattleRoomContainer();
  container.add(room1);
  const p2 = container.add(room2);
  
  const result = container.find(p2.id);
  const expected = {id: p2.id, battleRoom: room2}
  t.deepEqual(result, expected);
});

test('セッションID指定で検索することができる', t => {
  const container = new BattleRoomContainer();
  container.add(room1);
  const p2 = container.add(room2);
  
  const result = container.findByUserID(player3.userID);
  const expected = {id: p2.id, battleRoom: room2};
  t.deepEqual(result, expected);
});