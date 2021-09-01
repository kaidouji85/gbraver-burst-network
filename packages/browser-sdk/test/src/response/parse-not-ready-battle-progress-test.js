// @flow

import test from 'ava';
import type {NotReadyBattleProgress} from "../../../src/response/not-ready-battle-progress";
import {parseNotReadyBattleProgress} from "../../../src/response/not-ready-battle-progress";

const data: NotReadyBattleProgress = {action: 'not-ready-battle-progress'};

test('NotReadyBattleProgressなら正しくパースできる', t => {
  const result = parseNotReadyBattleProgress(data);
  t.deepEqual(result, data);
});

test('nullならパースできない', t => {
  const result = parseNotReadyBattleProgress(null);
  t.is(result, null);
});

test('undefinedならパースできない', t => {
  const result = parseNotReadyBattleProgress(undefined);
  t.is(result, null);
});
