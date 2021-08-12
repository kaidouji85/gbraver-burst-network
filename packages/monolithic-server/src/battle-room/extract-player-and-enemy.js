// @flow

import type {RoomPlayer} from './battle-room';
import type {Player} from 'gbraver-burst-core';
import type {UserID} from "../user/user";

/** 抽出結果 */
export type ExtractResult = {
  /** プレイヤー */
  player: Player,
  /** 敵 */
  enemy: Player,
};

/**
 * ユーザID指定でルームからプレイヤー、敵を抽出する
 * 
 * @param userID プレイヤーのユーザID
 * @param roomPlayers ルームプレイヤー
 * @return 抽出結果
 */
export function extractPlayerAndEnemy(userID: UserID, roomPlayers: [RoomPlayer, RoomPlayer]): ExtractResult {
  const player = roomPlayers.find(v => v.userID === userID);
  const enemy = roomPlayers.find(v => v.userID !== userID);
  if (!player || !enemy) {
    throw new Error('not found player or enemy');
  }

  return {player: player.player, enemy: enemy.player};
}