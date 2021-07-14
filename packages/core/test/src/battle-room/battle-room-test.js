// @flow

import test from 'ava';
import {EMPTY_ROOM_PLAYER} from "../../data/room-user";
import {EMPTY_PLAYER} from "gbraver-burst-core";
import {BattleRoom} from "../../../src/battle-room/battle-room";
import type {Command} from "gbraver-burst-core";
import type {RoomPlayer} from "../../../src/battle-room/battle-room";

/** テストプレイヤー1 */
const player1: RoomPlayer = {
  ...EMPTY_ROOM_PLAYER,
  userID: 'session1',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player1'
  }
};

/** テストプレイヤー2 */
const player2: RoomPlayer = {
  ...EMPTY_ROOM_PLAYER,
  userID: 'session2',
  player: {
    ...EMPTY_PLAYER,
    playerId: 'player2'
  }
};

/** テストコマンド */
const command: Command = {type: 'BATTERY_COMMAND', battery: 0};

test('ルームが正しく生成される', t => {
  const room = new BattleRoom([player1, player2]);
  t.truthy(room);
});

test('初期ゲームステートが正しく生成されている', t => {
  const room = new BattleRoom([player1, player2]);
  const result = 1 <= room.stateHistory().length;
  t.is(result, true);
});

test('ルーム入室ユーザが正しい', t => {
  const room = new BattleRoom([player1, player2]);
  const result = room.roomPlayers();
  const expected = [player1, player2];
  t.deepEqual(result, expected);
});

test('コマンド入力が1人目の場合、相手の入力待ちとなる', t => {
  const room = new BattleRoom([player1, player2]);
  const result = room.inputCommand(player1.userID, command);
  const expected = {type: 'Waiting'};
  t.deepEqual(result, expected);
});

test('相手の入力待ちの場合、ステートヒストリーは更新されない', t => {
  const room = new BattleRoom([player1, player2]);
  const history = room.stateHistory();
  room.inputCommand(player1.userID, command);
  const updatedHistory = room.stateHistory();
  t.deepEqual(history, updatedHistory);
});

test('同じユーザが2回コマンド入力した場合、エラーとなる', t => {
  t.throws(() => {
    const room = new BattleRoom([player1, player2]);
    room.inputCommand(player1.userID, command);
    room.inputCommand(player1.userID, command);
  });
});

test('同じユーザが2回コマンド入力した場合、ステートヒストリーは更新されない', t => {
  t.throws(() => {
    const room = new BattleRoom([player1, player2]);
    const history = room.stateHistory();
    room.inputCommand(player1.userID, command);
    room.inputCommand(player1.userID, command);
    const updatedHistory = room.stateHistory()
    t.deepEqual(history, updatedHistory);
  });
});

test('2人がコマンド入力したら、ゲームが進行する', t => {
  const room = new BattleRoom([player1, player2]);
  room.inputCommand(player1.userID, command);
  const result = room.inputCommand(player2.userID, command);
  t.true((result.type === 'Progress') && (1 <= result.update.length));
});

test('2人がコマンド入力したら、ゲームステートが更新される', t => {
  const room = new BattleRoom([player1, player2]);
  const firstState = room.stateHistory();
  room.inputCommand(player1.userID, command);
  const progress = room.inputCommand(player2.userID, command);
  const update = progress.type === 'Progress' ? progress.update : [];
  const afterProgress = room.stateHistory();
  t.deepEqual([...firstState, ...update], afterProgress);
});