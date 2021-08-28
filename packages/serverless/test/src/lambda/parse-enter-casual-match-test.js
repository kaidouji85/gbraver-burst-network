// @flow

import test from 'ava';
import {parseEnterCasualMatch} from "../../../src/lambda/enter-casual-match";
import type {EnterCasualMatch} from "../../../src/lambda/enter-casual-match";

const enterCasualMatch: EnterCasualMatch = {action: 'enter-casual-match', armdozerId: 'armdozerId', pilotId: 'pilotId'};

test('EnterCasualMatchを正しくパースできる', t => {
  const result = parseEnterCasualMatch(enterCasualMatch);
  t.deepEqual(result, enterCasualMatch);
});

test('余計なプロパティが含まれている場合でも問題なくパースできる', t => {
  const result = parseEnterCasualMatch({...enterCasualMatch, hp: 1000, power: 1000});
  t.deepEqual(result, enterCasualMatch);
});

test('nullならパースできない', t => {
  const result = parseEnterCasualMatch(null);
  t.is(result, null);
});

test('undefinedならパースできない', t => {
  const result = parseEnterCasualMatch(undefined);
  t.is(result, null);
});