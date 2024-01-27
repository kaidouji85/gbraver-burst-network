import { ArmdozerIds, PilotIds } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { CasualMatchEntry } from "../../../src/core/casual-match-entry";
import { startCasualMatch } from "../../../src/core/start-casual-match";
import { mockUniqUUID } from "../../mock-unique-uuid";

jest.mock("uuid");

/** カジュアルマッチ参加プレイヤー1 */
const entry01: CasualMatchEntry = {
  userID: "user-01",
  armdozerId: ArmdozerIds.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA,
  connectionId: "user-01-connection-id",
};

/** カジュアルマッチ参加プレイヤー2 */
const entry02: CasualMatchEntry = {
  userID: "user-02",
  armdozerId: ArmdozerIds.NEO_LANDOZER,
  pilotId: PilotIds.GAI,
  connectionId: "user-02-connection-id",
};

beforeEach(() => {
  (uuidv4 as jest.Mock).mockImplementation(mockUniqUUID());
});

afterEach(() => {
  (uuidv4 as jest.Mock).mockReset();
});

test("カジュアルマッチを正しく開始できる", () => {
  expect(startCasualMatch([entry01, entry02])).toMatchSnapshot();
});
