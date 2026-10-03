import { EMPTY_PLAYER } from "gbraver-burst-core";
import { nanoid } from "nanoid";

import { Battle, BattlePlayer } from "../../../../../src/core/battle/battle";
import {
  createRematchRoom,
  REMATCH_ROOM_TTL_SECONDS,
} from "../../../../../src/core/matching/rematch/create-rematch-room";

jest.mock("nanoid", () => ({
  nanoid: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
});

/** ホストプレイヤー */
const hostPlayer: BattlePlayer = {
  ...EMPTY_PLAYER,
  userID: "host-user",
  connectionId: "host-connection",
};

/** ゲストプレイヤー */
const guestPlayer: BattlePlayer = {
  ...EMPTY_PLAYER,
  userID: "guest-user",
  connectionId: "guest-connection",
};

/** バトル情報 */
const battle: Battle<BattlePlayer> = {
  battleID: "battle-id",
  flowID: "flow-id",
  players: [hostPlayer, guestPlayer],
  poller: hostPlayer.userID,
  stateHistory: [],
};

test("バトルから再戦ルームが正しく生成できる", () => {
  jest.spyOn(Date, "now").mockReturnValue(1_600_000_000_000);
  jest.mocked(nanoid).mockReturnValue("mocked-room-id");
  expect(createRematchRoom(battle)).toEqual({
    roomID: "mocked-room-id",
    hostUserID: hostPlayer.userID,
    guestUserID: guestPlayer.userID,
    expiresAt: 1_600_000_000 + REMATCH_ROOM_TTL_SECONDS,
  });
});
