import { EMPTY_GAME_STATE } from "gbraver-burst-core";

import type { BattleEnd } from "../../../src/response/battle-end";
import { parseBattleEnd } from "../../../src/response/battle-end";

const data: BattleEnd = {
  action: "battle-end",
  update: [EMPTY_GAME_STATE]
};

test("BattleEndを正しくパースできる", () => {
  const result = parseBattleEnd(data);
  expect(result).toEqual(data);
});

test("nullだとパースできない", () => {
  const result = parseBattleEnd(null);
  expect(result).toBe(null);
});

test("undefinedだとパースできない", () => {
  const result = parseBattleEnd(undefined);
  expect(result).toBe(null);
});