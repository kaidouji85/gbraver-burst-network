// @flow

import test from 'ava';
import type {BattleEnd} from "../../../src/response/battle-end";
import {EMPTY_GAME_STATE} from "gbraver-burst-core";
import {parseBattleEnd} from "../../../src/response/battle-end";

const data: BattleEnd = {action: 'battle-end', update: [EMPTY_GAME_STATE]};

test('BattleEndを正しくパースできる', t => {
  const result = parseBattleEnd(data);
  t.deepEqual(result, data);
});

test('nullだとパースできない', t => {
  const result = parseBattleEnd(null);
  t.is(result, null);
});

test('undefinedだとパースできない', t => {
  const result = parseBattleEnd(undefined);
  t.is(result, null);
});