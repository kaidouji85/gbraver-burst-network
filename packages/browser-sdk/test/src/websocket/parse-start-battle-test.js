// @flow

import test from 'ava';
import type {StartBattle} from "../../../src/websocket/response";
import {EMPTY_GAME_STATE, EMPTY_PLAYER} from "gbraver-burst-core";
import {parseStartBattle} from "../../../src/websocket/response";

const startBattle: StartBattle = {
  action: 'start-battle',
  battleID: 'xxxxx',
  flowID: 'xxxxx',
  player: {...EMPTY_PLAYER, playerId: 'player'},
  enemy: {...EMPTY_PLAYER, playerId: 'player'},
  stateHistory: [
    EMPTY_GAME_STATE
  ]
};

test('StartBattleなら正しくパースできる', t => {
  const result = parseStartBattle(startBattle);
  t.deepEqual(result, startBattle);
});

test('StartBattle以外だとパースできない', t => {
  const result = parseStartBattle({hp: 1000});
  t.is(result, null);
});

test('nullはパースできない', t => {
  const result = parseStartBattle(null);
  t.is(result, null);
});

test('undefinedはパースできない', t => {
  const result = parseStartBattle(undefined);
  t.is(result, null);
});