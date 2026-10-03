import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { isValidRematchMatch } from "../../../../../src/core/matching/rematch/is-valid-rematch-make";
import { RematchEntry } from "../../../../../src/core/matching/rematch/rematch-entry";
import { RematchRoom } from "../../../../../src/core/matching/rematch/rematch-room";
import { User } from "../../../../../src/core/user";

/** テスト用ルーム */
const room: RematchRoom = {
  roomID: "rematch-room",
  hostUserID: "host-user",
  guestUserID: "guest-user",
  expiresAt: 0,
};

/** ホストエントリ */
const hostEntry: RematchEntry = {
  roomID: room.roomID,
  userID: room.hostUserID,
  connectionId: "host-connection",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
  expiresAt: 0,
};

/** ゲストエントリ */
const guestEntry: RematchEntry = {
  roomID: room.roomID,
  userID: room.guestUserID,
  connectionId: "guest-connection",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
  expiresAt: 0,
};

/** 別ルームのエントリ */
const otherRoomEntry: RematchEntry = {
  roomID: "other-room",
  userID: "other-user",
  connectionId: "other-connection",
  armdozerId: ArmdozerIds.WING_DOZER,
  pilotId: PilotIds.TSUBASA,
  expiresAt: 0,
};

test("ホストが実行者で、関連ルームのエントリーであればマッチメイク可能", () => {
  const executor: User = { userID: room.hostUserID };
  expect(isValidRematchMatch({ executor, room, entries: [guestEntry] })).toBe(
    true,
  );
});

test("ホストが実行者でも、関連ルームのエントリーでなければマッチメイク不可", () => {
  const executor: User = { userID: room.hostUserID };
  expect(
    isValidRematchMatch({ executor, room, entries: [otherRoomEntry] }),
  ).toBe(false);
});

test("ホスト以外が実行者の場合、関連ルームエントリーであってもマッチメイク不可", () => {
  const executor: User = { userID: room.guestUserID };
  expect(isValidRematchMatch({ executor, room, entries: [guestEntry] })).toBe(
    false,
  );
});

test("ホストが実行者の場合、関連ルームエントリーが0でもマッチメイク可能", () => {
  const executor: User = { userID: room.hostUserID };
  expect(isValidRematchMatch({ executor, room, entries: [] })).toBe(true);
});
