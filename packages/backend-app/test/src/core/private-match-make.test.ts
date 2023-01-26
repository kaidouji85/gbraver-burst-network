import { ArmDozerIds, PilotIds } from "gbraver-burst-core";
import { BattleEntry } from "../../../src/core/battle-entry";
import { PrivateMatchEntry } from "../../../src/core/private-match-entry";
import { privateMatchMake } from "../../../src/core/private-match-make";
import { PrivateMatchRoom } from "../../../src/core/private-match-room";

const room: PrivateMatchRoom = {
  roomID: "test-room",
  owner: "owner",
  ownerConnectionId: "owner-connection",
  armdozerId: ArmDozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA
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
  armdozerId: ArmDozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
};
const entry02: PrivateMatchEntry = {
  roomID: room.roomID,
  userID: "entry-02",
  connectionId: "entry-02-connection",
  armdozerId: ArmDozerIds.WING_DOZER,
  pilotId: PilotIds.TSUBASA,
};
const entry03: PrivateMatchEntry = {
  roomID: room.roomID,
  userID: "entry-03",
  connectionId: "entry-03-connection",
  armdozerId: ArmDozerIds.LIGHTNING_DOZER,
  pilotId: PilotIds.RAITO,
};

test("正しくプライベートマッチングできる", () => {
  expect(privateMatchMake(room, [entry01, entry02, entry03]))
    .toEqual([ownerEntry, entry01]);
});