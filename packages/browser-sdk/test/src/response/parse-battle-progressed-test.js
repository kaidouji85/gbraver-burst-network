// @flow

import test from 'ava';
import type {BattleProgressed} from "../../../src/response/battle-progressed";
import {EMPTY_GAME_STATE} from "gbraver-burst-core";
import {parseBattleProgressed} from "../../../src/response/battle-progressed";

const data: BattleProgressed = {action: 'battle-progressed', flowID: 'flowID', update: [EMPTY_GAME_STATE]};

test('BattleProgressedを正しくパースできる', t => {
  const result = parseBattleProgressed(data);
  t.deepEqual(result, data);
});

test('nullはパースできない', t => {
  const result = parseBattleProgressed(null);
  t.is(result, null);
});

test('undefinedはパースできない', t => {
  const result = parseBattleProgressed(undefined);
  t.is(result, null);
});