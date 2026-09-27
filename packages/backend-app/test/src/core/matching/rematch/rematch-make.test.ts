import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { RematchEntry } from "../../../../../src/core/matching/rematch/rematch-entry";
import { rematchMake } from "../../../../../src/core/matching/rematch/rematch-make";
import { RematchRoom } from "../../../../../src/core/matching/rematch/rematch-room";

/** ルーム */
const room: RematchRoom = {
  roomID: "test-room",
  hostUserID: "host",
  guestUserID: "guest",
  expiresAt: 0,
};

/** ホストのエントリ */
const hostEntry: RematchEntry = {
  roomID: room.roomID,
  userID: room.hostUserID,
  connectionId: "host-connection",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
  expiresAt: 0,   
};

/** ゲストのエントリ */
const guestEntry: RematchEntry = {
  roomID: room.roomID,
  userID: room.guestUserID,
  connectionId: "guest-connection",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
  expiresAt: 0,
};

/** 関係ない人のエントリ */
const otherEntry: RematchEntry = {
  roomID: room.roomID,
  userID: "other",
  connectionId: "other-connection",
  armdozerId: ArmdozerIds.WING_DOZER,
  pilotId: PilotIds.TSUBASA,
  expiresAt: 0,
};

test("ホスト、ゲストでマッチングされる", () => {
  const entries = [hostEntry, guestEntry];
  expect(rematchMake(room, entries)).toEqual([hostEntry, guestEntry]);
});

test("関係ない人が混ざっていてもホスト、ゲストでマッチングされる", () => {
  const entries = [hostEntry, guestEntry, otherEntry];
  expect(rematchMake(room, entries)).toEqual([hostEntry, guestEntry]);
});

test("エントリが0件の場合はマッチング失敗", () => {
  expect(rematchMake(room, [])).toEqual(null);
});

test("ホストのみの場合はマッチング失敗", () => {
  const entries = [hostEntry];
  expect(rematchMake(room, entries)).toEqual(null);
});

test("ゲストのみの場合はマッチング失敗", () => {
  const entries = [guestEntry];
  expect(rematchMake(room, entries)).toEqual(null);
});
