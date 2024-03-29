import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { BattleEntry } from "../../../src/core/battle-entry";
import { PrivateMatchEntry } from "../../../src/core/private-match-entry";
import { privateMatchMake } from "../../../src/core/private-match-make";
import { PrivateMatchRoom } from "../../../src/core/private-match-room";

const room: PrivateMatchRoom = {
  roomID: "test-room",
  owner: "owner",
  ownerConnectionId: "owner-connection",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
};
const ownerEntry: BattleEntry = {
  userID: room.owner,
  connectionId: room.ownerConnectionId,
  armdozerId: room.armdozerId,
  pilotId: room.pilotId,
};
const entry01: PrivateMatchEntry = {
  roomID: room.roomID,
  userID: "entry-01",
  connectionId: "entry-01-connection",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
};
const entry02: PrivateMatchEntry = {
  roomID: room.roomID,
  userID: "entry-02",
  connectionId: "entry-02-connection",
  armdozerId: ArmdozerIds.WING_DOZER,
  pilotId: PilotIds.TSUBASA,
};
const entry03: PrivateMatchEntry = {
  roomID: room.roomID,
  userID: "entry-03",
  connectionId: "entry-03-connection",
  armdozerId: ArmdozerIds.LIGHTNING_DOZER,
  pilotId: PilotIds.RAITO,
};

test("ルーム作成者、エントリ先頭でマッチングされる", () => {
  expect(privateMatchMake(room, [entry01, entry02, entry03])).toEqual([
    ownerEntry,
    entry01,
  ]);
});

test("エントリが1件でも、マッチングされる", () => {
  expect(privateMatchMake(room, [entry03])).toEqual([ownerEntry, entry03]);
});

test("エントリが0件の場合、マッチングしない", () => {
  expect(privateMatchMake(room, [])).toEqual(null);
});
