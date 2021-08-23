// @flow

import test from 'ava';
import {parseEnterCasualMatch} from "../../../src/lambda/enter-casual-match";
import type {EnterCasualMatch} from "../../../src/lambda/enter-casual-match";

const enterCasualMatch: EnterCasualMatch = {action: 'enterCasualMatch', armdozerId: 'armdozerId', pilotId: 'pilotId'};

test('EnterCasualMatchのJSON文字列なら正しくパースできる', t => {
  const data = JSON.stringify(enterCasualMatch);
  const result = parseEnterCasualMatch(data);
  t.deepEqual(result, enterCasualMatch);
});

test('余計なプロパティが含まれている場合でも問題なくパースできる', t => {
  const addProps = {...enterCasualMatch, hp: 1000, power: 1000};
  const data = JSON.stringify(addProps);
  const result = parseEnterCasualMatch(data);
  t.deepEqual(result, enterCasualMatch);
});

