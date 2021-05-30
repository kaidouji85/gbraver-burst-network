// @flow

import test from 'ava';
import {EMPTY_ROOM_USER} from "../../data/room-user";
import type {RoomUser} from "../../../src/battle-room/room-user";
import {EMPTY_PLAYER} from "gbraver-burst-core";
import {BattleRoom} from "../../../src/battle-room/battle-room";

const user1: RoomUser = {
  ...EMPTY_ROOM_USER,
  userID: 'user1',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player1'
  }
};

const user2: RoomUser = {
  ...EMPTY_ROOM_USER,
  userID: 'user2',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player2'
  }
};

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