// @flow

import test from 'ava';
import {parseEnterCasualMatchBody} from "../../../src/lambda/enter-casual-match";
import type {EnterCasualMatchBody} from "../../../src/lambda/enter-casual-match";

const enterCasualMatch: EnterCasualMatchBody = {action: 'enterCasualMatch', armdozerId: 'armdozerId', pilotId: 'pilotId'};

test('EnterCasualMatchのJSON文字列なら正しくパースできる', t => {
  const data = JSON.stringify(enterCasualMatch);
  const result = parseEnterCasualMatchBody(data);
  t.deepEqual(result, enterCasualMatch);
});

test('余計なプロパティが含まれている場合でも問題なくパースできる', t => {
  const addProps = {...enterCasualMatch, hp: 1000, power: 1000};
  const data = JSON.stringify(addProps);
  const result = parseEnterCasualMatchBody(data);
  t.deepEqual(result, enterCasualMatch);
});

