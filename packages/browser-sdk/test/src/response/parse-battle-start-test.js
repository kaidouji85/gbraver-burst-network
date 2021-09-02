// @flow

import test from 'ava';
import type {BattleStart} from "../../../src/response/battle-start";
import {parseBattleStart} from "../../../src/response/battle-start";
import {EMPTY_GAME_STATE, EMPTY_PLAYER} from "gbraver-burst-core";

const startBattle: BattleStart = {
  action: 'battle-start',
  battleID: 'xxxxx',
  flowID: 'xxxxx',
  player: {...EMPTY_PLAYER, playerId: 'player'},
  enemy: {...EMPTY_PLAYER, playerId: 'player'},
  stateHistory: [
    EMPTY_GAME_STATE
  ],
  isPoller: true,
};

test('BattleStartなら正しくパースできる', t => {
  const result = parseBattleStart(startBattle);
  t.deepEqual(result, startBattle);
});

test('BattleStart以外だとパースできない', t => {
  const result = parseBattleStart({hp: 1000});
  t.is(result, null);
});

test('nullはパースできない', t => {
  const result = parseBattleStart(null);
  t.is(result, null);
});

test('undefinedはパースできない', t => {
  const result = parseBattleStart(undefined);
  t.is(result, null);
});