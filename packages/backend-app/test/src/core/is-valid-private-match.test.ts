import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { isValidPrivateMatch } from "../../../src/core/is-valid-private-match";
import { PrivateMatchEntry } from "../../../src/core/private-match-entry";
import { PrivateMatchRoom } from "../../../src/core/private-match-room";
import { User } from "../../../src/core/user";

const EmptyRoom: PrivateMatchRoom = {
  roomID: "",
  owner: "",
  ownerConnectionId: "",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
};
const EmptyEntry: PrivateMatchEntry = {
  roomID: "",
  userID: "",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
  connectionId: "",
};

test("有効なプライベートマッチ関連オブジェクトであることを判定できる", () => {
  const owner: User = { userID: "test-owner" };
  const room: PrivateMatchRoom = {
    ...EmptyRoom,
    roomID: "test-room",
    owner: owner.userID,
  };
  const entries: PrivateMatchEntry[] = [
    {
      ...EmptyEntry,
      roomID: room.roomID,
      userID: "participant-01",
    },
    {
      ...EmptyEntry,
      roomID: room.roomID,
      userID: "participant-02",
    },
  ];
  expect(isValidPrivateMatch({ owner, room, entries })).toBe(true);
});

test("エントリが0件でも有効なプライベートマッチである", () => {
  const owner: User = { userID: "test-owner" };
  const room: PrivateMatchRoom = {
    ...EmptyRoom,
    roomID: "test-room",
    owner: owner.userID,
  };
  const entries: PrivateMatchEntry[] = [];
  expect(isValidPrivateMatch({ owner, room, entries })).toBe(true);
});

test("owenrとroomのユーザIDが一致しない場合、データ不整合である", () => {
  const owner: User = { userID: "test-owner" };
  const room: PrivateMatchRoom = {
    ...EmptyRoom,
    roomID: "test-room",
    owner: "no-exist-owner",
  };
  const entries: PrivateMatchEntry[] = [];
  expect(isValidPrivateMatch({ owner, room, entries })).toBe(false);
});

test("entriesとroomのroomIDが一致しない場合、データ不整合である", () => {
  const owner: User = { userID: "test-owner" };
  const room: PrivateMatchRoom = {
    ...EmptyRoom,
    roomID: "test-room",
    owner: owner.userID,
  };
  const entries: PrivateMatchEntry[] = [
    {
      ...EmptyEntry,
      roomID: room.roomID,
      userID: "participant-01",
    },
    {
      ...EmptyEntry,
      roomID: "no-exist-room-id",
      userID: "participant-02",
    },
  ];
  expect(isValidPrivateMatch({ owner, room, entries })).toBe(false);
});

test("entriesにownerが含まれる場合、データ不整合である", () => {
  const owner: User = { userID: "test-owner" };
  const room: PrivateMatchRoom = {
    ...EmptyRoom,
    roomID: "test-room",
    owner: owner.userID,
  };
  const entries: PrivateMatchEntry[] = [
    {
      ...EmptyEntry,
      roomID: room.roomID,
      userID: "participant-01",
    },
    {
      ...EmptyEntry,
      roomID: room.roomID,
      userID: owner.userID,
    },
  ];
  expect(isValidPrivateMatch({ owner, room, entries })).toBe(false);
});
