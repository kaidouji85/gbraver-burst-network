import { nanoid } from "nanoid";

import { Battle, BattlePlayer } from "../../battle/battle";
import { RematchRoom } from "./rematch-room";

/** 再戦ルームの有効期限（秒） */
export const REMATCH_ROOM_TTL_SECONDS = 60 * 10;

/**
 * バトルから再戦ルームを作成する
 * @param battle バトル
 * @returns 再戦ルーム
 */
export const createRematchRoom = <X extends BattlePlayer>(
  battle: Battle<X>,
): RematchRoom => {
  const roomID = nanoid();
  const hostUserID = battle.players[0].userID;
  const hostUserConnectionId = battle.players[0].connectionId;
  const guestUserID = battle.players[1].userID;
  const guestUserConnectionId = battle.players[1].connectionId;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + REMATCH_ROOM_TTL_SECONDS;
  return {
    roomID,
    hostUserID,
    hostUserConnectionId,
    guestUserID,
    guestUserConnectionId,
    expiresAt,
  };
};
