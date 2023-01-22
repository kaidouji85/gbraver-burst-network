import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import {
  CreatePrivateMatchRoom,
  parseCreatePrivateMatchRoom,
} from "../../../src/request/create-private-match-room";

test("CreatePrivateMatchRoomならパースできる", () => {
  const data: CreatePrivateMatchRoom = {
    action: "create-private-match-room",
    armdozerId: ArmDozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
  };
  expect(parseCreatePrivateMatchRoom(data)).toEqual(data);
});

test("nullの場合、パースできない", () => {
  expect(parseCreatePrivateMatchRoom(null)).toBe(null);
});

test("undefinedの場合、パースできない", () => {
  expect(parseCreatePrivateMatchRoom(undefined)).toBe(null);
});
