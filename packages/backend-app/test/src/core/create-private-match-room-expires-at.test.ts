import { createPrivateMatchRoomExpiresAt } from "../../../src/core/create-private-match-room-expires-at";

test("現在時刻の12時間後をUNIX時間で返す", () => {
  const currentTimeMs = 1_700_000_000_123;
  expect(createPrivateMatchRoomExpiresAt(currentTimeMs)).toBe(
    Math.floor(currentTimeMs / 1000) + 60 * 60 * 12,
  );
});
