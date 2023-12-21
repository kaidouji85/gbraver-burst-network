import { ArmdozerIds, PilotIds } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { BattleEntry } from "../../../src/core/battle-entry";
import { PrivateMatchEntry } from "../../../src/core/private-match-entry";
import { PrivateMatching } from "../../../src/core/private-match-make";
import { startPrivateMatch } from "../../../src/core/start-private-match";
import { mockUniqUUID } from "../../mock-unique-uuid";

jest.mock("uuid");

/** テスト用ルームID */
const roomID = "test-room-id";

/** ルームオーナーのエントリ */
const ownerEntry: BattleEntry = {
  userID: "owner",
  connectionId: "owner-connection-id",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
};

/** 参加者1のエントリ */
const user1Entry: PrivateMatchEntry = {
  userID: "user1",
  connectionId: "user1-connection-id",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
  roomID,
};

/** 参加者2のエントリ */
const user2Entry: PrivateMatchEntry = {
  userID: "user2",
  connectionId: "user2-connection-id",
  armdozerId: ArmdozerIds.WING_DOZER,
  pilotId: PilotIds.TSUBASA,
  roomID,
};

/** 参加者3のエントリ */
const user3Entry: PrivateMatchEntry = {
  userID: "user3",
  connectionId: "user3-connection-id",
  armdozerId: ArmdozerIds.LIGHTNING_DOZER,
  pilotId: PilotIds.RAITO,
  roomID,
};

/** プライベートマッチルームの全エントリ */
const entries: PrivateMatchEntry[] = [user1Entry, user2Entry, user3Entry];

/** マッチング結果 */
const matching: PrivateMatching = [ownerEntry, user2Entry];

test("正しくプライベートマッチを開始できる", () => {
  (uuidv4 as jest.Mock).mockImplementation(mockUniqUUID());
  expect(startPrivateMatch(entries, matching)).toMatchSnapshot();
});
