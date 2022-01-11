// @flow

import type {BattleProgressPolling} from "../../../src/request/battle-progress-polling";
import {parseBattleProgressPolling} from "../../../src/request/battle-progress-polling";

const data: BattleProgressPolling = {action: 'battle-progress-polling', battleID: 'battleID', flowID: 'flowID'};

test('BattleProgressPollingならパースできる', () => {
  const result = parseBattleProgressPolling(data);
  expect(result).toEqual(data);
});

test('nullはパースできない', () => {
  const result = parseBattleProgressPolling(null);
  expect(result).toBe(null);
});

test('undefinedはパースできない', () => {
  const result = parseBattleProgressPolling(undefined);
  expect(result).toBe(null);
});