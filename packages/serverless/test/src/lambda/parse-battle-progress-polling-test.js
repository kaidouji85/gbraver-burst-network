// @flow

import test from 'ava';
import type {BattleProgressPolling} from "../../../src/request/battle-progress-polling";
import {parseBattleProgressPolling} from "../../../src/request/battle-progress-polling";

const data: BattleProgressPolling = {action: 'battle-progress-polling', battleID: 'battleID', flowID: 'flowID'};

test('BattleProgressPollingならパースできる', t => {
  const result = parseBattleProgressPolling(data);
  t.deepEqual(result, data);
});

test('nullはパースできない', t => {
  const result = parseBattleProgressPolling(null);
  t.is(result, null);
});

test('undefinedはパースできない', t => {
  const result = parseBattleProgressPolling(undefined);
  t.is(result, null);
});