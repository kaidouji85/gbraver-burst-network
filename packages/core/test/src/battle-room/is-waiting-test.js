// @flow

import test from 'ava';
import {isWaiting} from "../../../src/battle-room/is-waiting";

const batteryCommand = {type: 'BATTERY_COMMAND', battery: 4};

test('ルームのコマンド入力が1個の場合、相手待ちである', t => {
  const roomCommands = [
    {playerId: 'player01', command: batteryCommand},
  ];
  const result = isWaiting(roomCommands);
  t.true(result);
});

test('ルームのコマンド入力が2個の場合、相手待ちではない', t => {
  const roomCommands = [
    {playerId: 'player01', command: batteryCommand},
    {playerId: 'player02', command: batteryCommand},
  ];
  const result = isWaiting(roomCommands);
  t.false(result);
});