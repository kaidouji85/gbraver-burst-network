import { ArmDozerIds, PilotIds } from "gbraver-burst-core";

import { BattleEntry } from "../../../src/core/battle-entry";
import { deletedPrivateMatchEntry } from "../../../src/core/deleted-private-match-entry";
import { PrivateMatchEntry } from "../../../src/core/private-match-entry";
import { PrivateMatching } from "../../../src/core/private-match-make";

const owner: BattleEntry = {
  userID: "owner",
  connectionId: "owner-connection",
  armdozerId: ArmDozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
};
const matchedPlayer: BattleEntry = {
  userID: "matched-player",
  connectionId: "matched-player-connection",
  armdozerId: ArmDozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
};

const roomID = "test-room";
const matchedPlayerEntry: PrivateMatchEntry = {
  ...matchedPlayer,
  roomID,
};
const unmatchedEntry01: PrivateMatchEntry = {
  roomID,
  userID: "unmatched-player-01",
  connectionId: "unmatched-player-01-connection",
  armdozerId: ArmDozerIds.WING_DOZER,
  pilotId: PilotIds.TSUBASA,
};
const unmatchedEntry02: PrivateMatchEntry = {
  roomID,
  userID: "unmatched-player-02",
  connectionId: "unmatched-player-02-connection",
  armdozerId: ArmDozerIds.LIGHTNING_DOZER,
  pilotId: PilotIds.RAITO,
};

test("マッチングしたユーザ以外が削除対象", () => {
  const matching: PrivateMatching = [owner, matchedPlayer];
  const entries: PrivateMatchEntry[] = [
    matchedPlayerEntry,
    unmatchedEntry01,
    unmatchedEntry02,
  ];
  expect(deletedPrivateMatchEntry(matching, entries)).toEqual([
    unmatchedEntry01,
    unmatchedEntry02,
  ]);
});

test("エントリにマッチングユーザしか存在しない場合でも、正しく動く", () => {
  const matching: PrivateMatching = [owner, matchedPlayer];
  const entries: PrivateMatchEntry[] = [matchedPlayerEntry];
  expect(deletedPrivateMatchEntry(matching, entries)).toEqual([]);
});

test("エントリが空の場合、空配列を返す", () => {
  const matching: PrivateMatching = [owner, matchedPlayer];
  const entries: PrivateMatchEntry[] = [];
  expect(deletedPrivateMatchEntry(matching, entries)).toEqual([]);
});
