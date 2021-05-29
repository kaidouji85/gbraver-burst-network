// @flow

import test from 'ava';
import type {Command} from "gbraver-burst-core";
import {extractCommands} from "../../../src/battle-room/extract-commands";

const command: Command = {type: 'BATTERY_COMMAND', battery: 5};

test('ルームのコマンド入力が2個の場合、正しくコマンド抽出ができる', t => {
  const player01Command = {playerId: 'player01', command};
  const player02Command = {playerId: 'player02', command};
  const roomCommands = [player01Command, player02Command];
  const result = extractCommands(roomCommands);
  const expected = {
    commands: [player01Command, player02Command],
    roomCommands: []
  };
  t.deepEqual(result, expected);
});

test('ルームのコマンド入力が1個の場合、コマンド抽出ができない', t => {
  const player01Command = {playerId: 'player01', command};
  const roomCommands = [player01Command];
  const result = extractCommands(roomCommands);
  t.is(null, result);
});