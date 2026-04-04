/** プライベートマッチルーム TTL 秒数（12時間） */
export const PRIVATE_MATCH_ROOM_TTL_SECONDS = 60 * 60 * 12;

/**
 * プライベートマッチルームの TTL を計算する
 * @param currentTimeMs 現在時刻（UNIX epoch milliseconds）
 * @returns 失効時刻（UNIX epoch seconds）
 */
export function createPrivateMatchRoomExpiresAt(
  currentTimeMs: number = Date.now(),
): number {
  return Math.floor(currentTimeMs / 1000) + PRIVATE_MATCH_ROOM_TTL_SECONDS;
}
