import { ArmdozerIds, PilotIds } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { BattleEntry } from "../../../../../src/core/matching/battle-entry";
import { Rematching } from "../../../../../src/core/matching/rematch/rematch-make";
import { startRematch } from "../../../../../src/core/matching/rematch/start-rematch";
import { mockUniqUUID } from "../../../../mock-unique-uuid";

jest.mock("uuid");

beforeEach(() => {
  (uuidv4 as jest.Mock).mockImplementation(mockUniqUUID());
});

afterEach(() => {
  (uuidv4 as jest.Mock).mockReset();
});

/** 再戦参加プレイヤー1 */
const entry01: BattleEntry = {
  userID: "user-01",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
  connectionId: "user-01-connection-id",
};

/** 再戦参加プレイヤー2 */
const entry02: BattleEntry = {
  userID: "user-02",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
  connectionId: "user-02-connection-id",
};

test("再戦を正しく開始できる", () => {
  const matching: Rematching = [entry01, entry02];
  expect(startRematch(matching)).toMatchSnapshot();
});
