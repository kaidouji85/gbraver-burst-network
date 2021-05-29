// @flow

import test from 'ava';
import {EMPTY_ROOM_USER} from "../../data/room-user";
import {EMPTY_PLAYER} from "gbraver-burst-core/lib/empty/player";
import {isDoubleEnter} from "../../../src/battle-room/is-double-enter";

const user1 = {
  ...EMPTY_ROOM_USER,
  userID: 'test1',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player1'
  }
};
const user2 = {
  ...EMPTY_ROOM_USER,
  userID: 'test2',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player2'
  }
};
const batteryCommand = {type: 'BATTERY_COMMAND', battery: 1};
const user1Command = {playerId: user1.player.playerId, command: batteryCommand};

test('ルームコマンド、入力コマンドのユーザIDが一致する場合、二重入力である', t => {
  const roomUsers = [user1, user2];
  const roomCommands = [user1Command];
  const result = isDoubleEnter(roomUsers, roomCommands, user1.userID);
  t.true(result);
});

test('ルームコマンド、入力コマンドのユーザIDが一致しない場合、二重入力ではない', t => {
  const roomUsers = [user1, user2];
  const roomCommands = [user1Command];
  const result = isDoubleEnter(roomUsers, roomCommands, user2.userID);
  t.false(result);
});

test('ルームコマンドがない状態で入力した場合、二重入力ではない', t => {
  const roomUsers = [user1, user2];
  const roomCommands = [];
  const result = isDoubleEnter(roomUsers, roomCommands, user1.userID);
  t.false(result);
});