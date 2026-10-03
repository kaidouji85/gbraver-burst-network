import { canEntryRematchRoom } from "../../../../../src/core/matching/rematch/can-entry-rematch-room";
import { RematchRoom } from "../../../../../src/core/matching/rematch/rematch-room";
import { User } from "../../../../../src/core/user";

/** テスト用の再戦ルーム */
const room: RematchRoom = {
  roomID: "rematch-room",
  hostUserID: "host-user",
  guestUserID: "guest-user",
  expiresAt: 0,
};

test("ホストユーザーは再戦ルームにエントリできる", () => {
  const user: User = { userID: room.hostUserID };
  expect(canEntryRematchRoom({ room, user })).toBe(true);
});

test("ゲストユーザーは再戦ルームにエントリできる", () => {
  const user: User = { userID: room.guestUserID };
  expect(canEntryRematchRoom({ room, user })).toBe(true);
});

test("ホストでもゲストでもないユーザーは再戦ルームにエントリできない", () => {
  const user: User = { userID: "other-user" };
  expect(canEntryRematchRoom({ room, user })).toBe(false);
});
