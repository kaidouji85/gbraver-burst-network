// @flow

import test from 'ava';
import {EMPTY_ROOM_USER} from "../../data/room-user";
import type {RoomUser} from "../../../src/battle-room/room-user";
import {EMPTY_PLAYER} from "gbraver-burst-core";
import {BattleRoom} from "../../../src/battle-room/battle-room";
import type {Command} from "gbraver-burst-core";

/** テストユーザ1 */
const user1: RoomUser = {
  ...EMPTY_ROOM_USER,
  userID: 'user1',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player1'
  }
};

/** テストユーザ2 */
const user2: RoomUser = {
  ...EMPTY_ROOM_USER,
  userID: 'user2',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player2'
  }
};

/** テストコマンド */
const command: Command = {type: 'BATTERY_COMMAND', battery: 0};

test('ルームが正しく生成される', t => {
  const room = new BattleRoom([user1, user2]);
  t.truthy(room);
});

test('初期ゲームステートが正しく生成されている', t => {
  const room = new BattleRoom([user1, user2]);
  const result = 1 <= room.stateHistory().length;
  t.is(result, true);
});

test('ルーム入室ユーザが正しい', t => {
  const room = new BattleRoom([user1, user2]);
  const result = room.roomUsers();
  const expected = [user1, user2];
  t.deepEqual(result, expected);
});

test('コマンド入力が1人目の場合、相手の入力待ちとなる', t => {
  const room = new BattleRoom([user1, user2]);
  const result = room.enter(user1.userID, command);
  const expected = {type: 'Waiting'};
  t.deepEqual(result, expected);
});

test('相手の入力待ちの場合、ステートヒストリーは更新されない', t => {
  const room = new BattleRoom([user1, user2]);
  const history = room.stateHistory();
  room.enter(user1.userID, command);
  const updatedHistory = room.stateHistory();
  t.deepEqual(history, updatedHistory);
});

test('同じユーザが2回コマンド入力した場合、エラーとなる', t => {
  const room = new BattleRoom([user1, user2]);
  room.enter(user1.userID, command);
  const result = room.enter(user1.userID, command);
  t.is(result.type, 'Error');
});

test('同じユーザが2回コマンド入力した場合、ステートヒストリーは更新されない', t => {
  const room = new BattleRoom([user1, user2]);
  const history = room.stateHistory();
  room.enter(user1.userID, command);
  room.enter(user1.userID, command);
  const updatedHistory = room.stateHistory()
  t.deepEqual(history, updatedHistory);
});

test('2人がコマンド入力したら、ゲームが進行する', t => {
  const room = new BattleRoom([user1, user2]);
  room.enter(user1.userID, command);
  const result = room.enter(user2.userID, command);
  t.true((result.type === 'Progress') && (1 <= result.update.length));
});