import type { EnterCasualMatch } from "../../../src/request/enter-casual-match";
import { parseEnterCasualMatch } from "../../../src/request/enter-casual-match";

/** 有効なカジュアルマッチエントリのリクエストボディ */
const enterCasualMatch: EnterCasualMatch = {
  action: "enter-casual-match",
  armdozerId: "armdozerId",
  pilotId: "pilotId",
};

test("EnterCasualMatchを正しくパースできる", () => {
  const result = parseEnterCasualMatch(enterCasualMatch);
  expect(result).toEqual(enterCasualMatch);
});

test("余計なプロパティが含まれている場合でも問題なくパースできる", () => {
  const result = parseEnterCasualMatch({
    ...enterCasualMatch,
    hp: 1000,
    power: 1000,
  });
  expect(result).toEqual(enterCasualMatch);
});

test("データ型が異なればパースできない", () => {
  const result = parseEnterCasualMatch({
    ...enterCasualMatch,
    armdozerId: 1000,
    pilotId: 1000,
  });
  expect(result).toEqual(null);
});

test("nullならパースできない", () => {
  const result = parseEnterCasualMatch(null);
  expect(result).toBe(null);
});

test("undefinedならパースできない", () => {
  const result = parseEnterCasualMatch(undefined);
  expect(result).toBe(null);
});
