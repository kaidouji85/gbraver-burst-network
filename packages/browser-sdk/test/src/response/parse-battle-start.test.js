// @flow

import { EMPTY_GAME_STATE, EMPTY_PLAYER } from "gbraver-burst-core";

import type { BattleStart } from "../../../src/response/battle-start";
import { parseBattleStart } from "../../../src/response/battle-start";

const battleStart: BattleStart = {
  action: "battle-start",
  battleID: "xxxxx",
  flowID: "xxxxx",
  player: { ...EMPTY_PLAYER, playerId: "player" },
  enemy: { ...EMPTY_PLAYER, playerId: "player" },
  stateHistory: [EMPTY_GAME_STATE],
  isPoller: true,
};

test("BattleStartなら正しくパースできる", () => {
  const result = parseBattleStart(battleStart);
  expect(result).toEqual(battleStart);
});

test("BattleStart以外だとパースできない", () => {
  const result = parseBattleStart({ hp: 1000 });
  expect(result).toBe(null);
});

test("nullはパースできない", () => {
  const result = parseBattleStart(null);
  expect(result).toBe(null);
});

test("undefinedはパースできない", () => {
  const result = parseBattleStart(undefined);
  expect(result).toBe(null);
});
