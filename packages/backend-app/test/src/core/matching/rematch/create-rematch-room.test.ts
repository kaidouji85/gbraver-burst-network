import { EMPTY_PLAYER } from "gbraver-burst-core";
import { nanoid } from "nanoid";

import { BattlePlayer } from "../../../../../src/core/battle/battle";
import {
  createRematchRoom,
  REMATCH_ROOM_TTL_SECONDS,
} from "../../../../../src/core/matching/rematch/create-rematch-room";

jest.mock("nanoid", () => ({
  nanoid: jest.fn(),
}));

/** ホストプレイヤー */
const hostPlayer: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "host-player",
  userID: "host-user",
  connectionId: "host-connection",
};

/** ゲストプレイヤー */
const guestPlayer: BattlePlayer = {
  ...EMPTY_PLAYER,
  playerId: "guest-player",
  userID: "guest-user",
  connectionId: "guest-connection",
};

/** バトル情報 */
const battle = {
  battleID: "battle-id",
  flowID: "flow-id",
  players: [hostPlayer, guestPlayer] as [BattlePlayer, BattlePlayer],
  poller: hostPlayer.playerId,
  stateHistory: [],
};

test("nanoidが生成したIDをroomIDに設定する", () => {
  jest.spyOn(Date, "now").mockReturnValue(1_600_000_000_000);
  jest.mocked(nanoid).mockReturnValue("mocked-room-id");

  const result = createRematchRoom(battle);

  expect(result.roomID).toBe("mocked-room-id");
});

test("プレイヤー0番目をhostUserID、1番目をguestUserIDに設定する", () => {
  jest.spyOn(Date, "now").mockReturnValue(1_600_000_000_000);
  jest.mocked(nanoid).mockReturnValue("mocked-room-id");

  const result = createRematchRoom(battle);

  expect(result.hostUserID).toBe(hostPlayer.playerId);
  expect(result.guestUserID).toBe(guestPlayer.playerId);
});

test("Date.now()から有効期限を算出する", () => {
  jest.spyOn(Date, "now").mockReturnValue(1_600_000_000_000);
  jest.mocked(nanoid).mockReturnValue("mocked-room-id");

  const result = createRematchRoom(battle);

  expect(result.expiresAt).toBe(1_600_000_000 + REMATCH_ROOM_TTL_SECONDS);
});
