// @flow

import test from 'ava';
import type {EnteredCasualMatch} from "../../../src/response/entered-casual-match";
import {parseEnteredCasualMatch} from "../../../src/response/entered-casual-match";

const data: EnteredCasualMatch = {action: 'entered-casual-match'};

test('EnteredCasualMatchなら正しくパースできる', t => {
  const result = parseEnteredCasualMatch(data);
  t.deepEqual(result, data);
});

test('nullならパースできない', t => {
  const result = parseEnteredCasualMatch(null);
  t.is(result, null);
});

test('undefinedならパースできない', t => {
  const result = parseEnteredCasualMatch(undefined);
  t.is(result, null);
});
