import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import {
  CreatePrivateMatchRoom,
  isCreatePrivateMatchRoom,
} from "../../../src/request/create-private-match-room";

test("CreatePrivateMatchRoomなら、trueを返す", () => {
  const data: CreatePrivateMatchRoom = {
    action: "create-private-match-room",
    armdozerId: ArmDozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
  };
  expect(isCreatePrivateMatchRoom(data)).toBe(true);
});

test("actionが異なる場合、falseを返す", () => {
  const data = {
    action: "create-private-room",
    armdozerId: ArmDozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
  };
  expect(isCreatePrivateMatchRoom(data)).toBe(false);
});

test("データ型が違う場合、falseを返す", () => {
  const data = {
    action: "create-private-match-room",
    armdozerId: 100,
    pilotId: 100,
  };
  expect(isCreatePrivateMatchRoom(data)).toBe(false);
});

test("プロパティが足りない場合、falseを返す", () => {
  const data = {
    action: "create-private-room",
    pilotId: PilotIds.SHINYA,
  };
  expect(isCreatePrivateMatchRoom(data)).toBe(false);
});

test("CreatePrivateMatchRoomよりもプロパティが多い場合、trueを返す", () => {
  const data = {
    action: "create-private-match-room",
    armdozerId: ArmDozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
    anyProps: "value",
  };
  expect(isCreatePrivateMatchRoom(data)).toBe(true);
});

test("nullの場合、falseを返す", () => {
  expect(isCreatePrivateMatchRoom(null)).toBe(false);
});

test("undefinedの場合、falseを返す", () => {
  expect(isCreatePrivateMatchRoom(null)).toBe(false);
});
