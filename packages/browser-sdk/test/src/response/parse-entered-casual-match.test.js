// @flow

import type {EnteredCasualMatch} from "../../../src/response/entered-casual-match";
import {parseEnteredCasualMatch} from "../../../src/response/entered-casual-match";

const data: EnteredCasualMatch = {action: 'entered-casual-match'};

test('EnteredCasualMatchなら正しくパースできる', () => {
  const result = parseEnteredCasualMatch(data);
  expect(result).toEqual(data);
});

test('nullならパースできない', () => {
  const result = parseEnteredCasualMatch(null);
  expect(result).toBe(null);
});

test('undefinedならパースできない', () => {
  const result = parseEnteredCasualMatch(undefined);
  expect(result).toBe(null);
});
