import { EMPTY_GAME_STATE } from "gbraver-burst-core";

import type { BattleProgressed } from "../../../src/response/battle-progressed";
import { parseBattleProgressed } from "../../../src/response/battle-progressed";

const data: BattleProgressed = {
  action: "battle-progressed",
  flowID: "flowID",
  update: [EMPTY_GAME_STATE],
};

test("BattleProgressedを正しくパースできる", () => {
  const result = parseBattleProgressed(data);
  expect(result).toEqual(data);
});

test("nullはパースできない", () => {
  const result = parseBattleProgressed(null);
  expect(result).toBe(null);
});

test("undefinedはパースできない", () => {
  const result = parseBattleProgressed(undefined);
  expect(result).toBe(null);
});
