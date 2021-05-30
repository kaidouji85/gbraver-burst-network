// @flow

import test from 'ava';
import {isDoubleEnterCommand} from "../../../src/battle-room/is-double-enter-command";

const batteryCommand = {type: 'BATTERY_COMMAND', battery: 1};

test('ルームコマンド、入力コマンドのユーザIDが一致する場合、二重入力である', t => {
  const roomCommands = [{playerId: 'player01', command: batteryCommand}];
  const result = isDoubleEnterCommand(roomCommands, 'player01');
  t.true(result);
});

test('ルームコマンド、入力コマンドのユーザIDが一致しない場合、二重入力ではない', t => {
  const roomCommands = [{playerId: 'player01', command: batteryCommand}];
  const result = isDoubleEnterCommand(roomCommands, 'player02');
  t.false(result);
});

test('ルームコマンドがない状態で入力した場合、二重入力ではない', t => {
  const roomCommands = [];
  const result = isDoubleEnterCommand(roomCommands, 'player01');
  t.false(result);
});
