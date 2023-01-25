import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import {
  EnterCasualMatch,
  parseEnterCasualMatch,
} from "../../../src/request/enter-casual-match";

test("EnterCasualMatchはパースできる", () => {
  const data: EnterCasualMatch = {
    action: "enter-casual-match",
    armdozerId: ArmDozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
  };
  expect(parseEnterCasualMatch(data)).toEqual(data);
});

test("データ型が異なるとパースできない", () => {
  const data = {
    action: "enter-casual-match",
    armdozerId: 100,
    pilotId: 100,
  };
  expect(parseEnterCasualMatch(data)).toBe(null);
});

test("nullはパースできない", () => {
  const data = null;
  expect(parseEnterCasualMatch(data)).toBe(null);
});

test("undefinedはパースできない", () => {
  const data = undefined;
  expect(parseEnterCasualMatch(data)).toBe(null);
});
