import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { RematchEntry } from "./rematch-entry";
import { RematchRoomID } from "./rematch-room";
import { UserID } from "../../user";

/** 再戦エントリのTTL(UNIX秒) */
export const REMATCH_ENTRY_EXPIRATION_SECONDS = 60 * 5;

/**
 * 再戦エントリを生成する
 * @param options オプション
 * @param options.armdozerId アームドーザID
 * @param options.pilotId パイロットID
 * @param options.roomID 再戦ルームID
 * @param options.connectionId 接続ID
 * @param options.userID ユーザーID
 * @returns 生成された再戦エントリ
 */
export const createRematchEntry = (options: {
  armdozerId: ArmdozerId;
  pilotId: PilotId;
  roomID: RematchRoomID;
  connectionId: string;
  userID: UserID;
}): RematchEntry => {
  const now = Math.floor(Date.now() / 1000);
  return {
    ...options,
    expiresAt: now + REMATCH_ENTRY_EXPIRATION_SECONDS,
  };
};
