import { matchMake } from "../../src/core/match-make";

test("エントリが空の場合は、空配列を返す", () => {
  expect(matchMake([])).toEqual([]);
});
