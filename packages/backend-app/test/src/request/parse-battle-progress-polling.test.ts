import type { BattleProgressPolling } from "../../../src/request/battle-progress-polling";
import { parseBattleProgressPolling } from "../../../src/request/battle-progress-polling";

/** 有効なバトル進行ポーリング */
const data: BattleProgressPolling = {
  action: "battle-progress-polling",
  battleID: "battleID",
  flowID: "flowID",
};

test("BattleProgressPollingならパースできる", () => {
  const result = parseBattleProgressPolling(data);
  expect(result).toEqual(data);
});

test("余計なプロパティは削除してパースする", () => {
  const result = parseBattleProgressPolling({ ...data, hp: 1000 });
  expect(result).toEqual(data);
});

test("nullはパースできない", () => {
  const result = parseBattleProgressPolling(null);
  expect(result).toBe(null);
});

test("undefinedはパースできない", () => {
  const result = parseBattleProgressPolling(undefined);
  expect(result).toBe(null);
});
