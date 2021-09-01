// @flow

import test from 'ava';
import type {SuddenlyBattleEnd} from "../../../src/response/suddenly-battle-end";
import {parseSuddenlyBattleEnd} from "../../../src/response/suddenly-battle-end";

const data: SuddenlyBattleEnd = {action: 'suddenly-battle-end'};

test('SuddenlyBattleEndなら正しくパースできる', t => {
  const result = parseSuddenlyBattleEnd(data);
  t.deepEqual(result, data);
});

test('nullならパースできない', t => {
  const result = parseSuddenlyBattleEnd(null);
  t.is(result, null);
});

test('undefinedならパースできない', t => {
  const result = parseSuddenlyBattleEnd(undefined);
  t.is(result, null);
});
