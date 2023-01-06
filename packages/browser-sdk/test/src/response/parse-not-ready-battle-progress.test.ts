import type { NotReadyBattleProgress } from "../../../src/response/not-ready-battle-progress";
import { parseNotReadyBattleProgress } from "../../../src/response/not-ready-battle-progress";

const data: NotReadyBattleProgress = {
  action: "not-ready-battle-progress"
};

test("NotReadyBattleProgressなら正しくパースできる", () => {
  const result = parseNotReadyBattleProgress(data);
  expect(result).toEqual(data);
});

test("nullならパースできない", () => {
  const result = parseNotReadyBattleProgress(null);
  expect(result).toBe(null);
});

test("undefinedならパースできない", () => {
  const result = parseNotReadyBattleProgress(undefined);
  expect(result).toBe(null);
});