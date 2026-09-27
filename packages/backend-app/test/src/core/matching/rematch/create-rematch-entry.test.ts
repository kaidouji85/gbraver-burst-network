import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import {
  createRematchEntry,
  REMATCH_ENTRY_EXPIRATION_SECONDS,
} from "../../../../../src/core/matching/rematch/create-rematch-entry";

afterEach(() => {
  jest.restoreAllMocks();
});

test("再戦エントリを正しく生成できる", () => {
  const now = 1_600_000_000_000;
  jest.spyOn(Date, "now").mockReturnValue(now);

  expect(
    createRematchEntry({
      armdozerId: ArmdozerIds.SHIN_BRAVER,
      pilotId: PilotIds.SHINYA,
      roomID: "rematch-room",
      connectionId: "connection",
      userID: "user",
    }),
  ).toEqual({
    armdozerId: ArmdozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
    roomID: "rematch-room",
    connectionId: "connection",
    userID: "user",
    expiresAt: Math.floor(now / 1000) + REMATCH_ENTRY_EXPIRATION_SECONDS,
  });
});