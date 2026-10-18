/** プライベートマッチルーム TTL 秒数（12時間） */
export const PRIVATE_MATCH_ROOM_TTL_SECONDS = 60 * 60 * 12;

/**
 * プライベートマッチルームの TTL を計算する
 * @param currentTimeSec 現在時刻（epoch seconds）
 * @returns 失効時刻（epoch seconds）
 */
export const createPrivateMatchRoomExpiresAt = (
  currentTimeSec: number = Math.floor(Date.now() / 1000),
): number => currentTimeSec + PRIVATE_MATCH_ROOM_TTL_SECONDS;
