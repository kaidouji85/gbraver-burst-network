// @flow

import test from 'ava';
import {isDoubleEnter} from "../../../src/battle-room/is-double-enter";

const batteryCommand = {type: 'BATTERY_COMMAND', battery: 1};

test('ルームコマンド、入力コマンドのユーザIDが一致する場合、二重入力である', t => {
  const roomCommands = [{playerId: 'player01', command: batteryCommand}];
  const result = isDoubleEnter(roomCommands, 'player01');
  t.true(result);
});

test('ルームコマンド、入力コマンドのユーザIDが一致しない場合、二重入力ではない', t => {
  const roomCommands = [{playerId: 'player01', command: batteryCommand}];
  const result = isDoubleEnter(roomCommands, 'player02');
  t.false(result);
});

test('ルームコマンドがない状態で入力した場合、二重入力ではない', t => {
  const roomCommands = [];
  const result = isDoubleEnter(roomCommands, 'player01');
  t.false(result);
});
