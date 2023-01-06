import type { SuddenlyBattleEnd } from "../../../src/response/suddenly-battle-end";
import { parseSuddenlyBattleEnd } from "../../../src/response/suddenly-battle-end";

const data: SuddenlyBattleEnd = {
  action: "suddenly-battle-end"
};

test("SuddenlyBattleEndなら正しくパースできる", () => {
  const result = parseSuddenlyBattleEnd(data);
  expect(result).toEqual(data);
});

test("nullならパースできない", () => {
  const result = parseSuddenlyBattleEnd(null);
  expect(result).toBe(null);
});

test("undefinedならパースできない", () => {
  const result = parseSuddenlyBattleEnd(undefined);
  expect(result).toBe(null);
});