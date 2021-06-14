// @flow

import type {RoomPlayer} from './battle-room';
import type {Player} from 'gbraver-burst-core';
import type {SessionID} from '../session/session';

/** 抽出結果 */
export type ExtractResult = {
  /** プレイヤー */
  player: Player,
  /** 敵 */
  enemy: Player,
};

/**
 * セッションID指定でルームからプレイヤー、敵を抽出する
 * 
 * @param playerSessionID プレイヤーのセッションID
 * @param roomPlayers ルームプレイヤー
 * @return 抽出結果
 */
export function extractPlayerAndEnemy(playerSessionID: SessionID, roomPlayers: [RoomPlayer, RoomPlayer]): ExtractResult {
  const player = roomPlayers.find(v => v.sessionID === playerSessionID);
  const enemy = roomPlayers.find(v => v.sessionID !== playerSessionID);
  if (!player || !enemy) {
    throw new Error('not found player or enemy');
  }

  return {player: player.player, enemy: enemy.player};
}