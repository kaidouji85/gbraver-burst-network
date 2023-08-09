import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import {
  CreatePrivateMatchRoom,
  parseCreatePrivateMatchRoom,
} from "../../../src/request/create-private-match-room";

/** 有効なプライベートマッチルーム生成 */
const createPrivateMatchRoom: CreatePrivateMatchRoom = {
  action: "create-private-match-room",
  armdozerId: ArmDozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
};

test("CreatePrivateMatchRoomならパースできる", () => {
  expect(parseCreatePrivateMatchRoom(createPrivateMatchRoom)).toEqual(
    createPrivateMatchRoom,
  );
});

test("余計なパラメータは削除してパースする", () => {
  expect(
    parseCreatePrivateMatchRoom({ ...createPrivateMatchRoom, hp: 1000 }),
  ).toEqual(createPrivateMatchRoom);
});

test("データ型が異なるとパースできない", () => {
  const data = {
    action: "create-private-match-room",
    armdozerId: 100,
    pilotId: 100,
  };
  expect(parseCreatePrivateMatchRoom(data)).toEqual(null);
});

test("nullの場合、パースできない", () => {
  expect(parseCreatePrivateMatchRoom(null)).toBe(null);
});

test("undefinedの場合、パースできない", () => {
  expect(parseCreatePrivateMatchRoom(undefined)).toBe(null);
});
