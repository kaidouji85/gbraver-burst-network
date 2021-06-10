// @flow

import {Socket} from 'socket.io';
import type {Command, GameState} from 'gbraver-burst-core';
import type {AllBattleRooms, BattleRoomID} from '@gbraver-burst-network/core';
import type {AccessTokenPayload} from '../../auth/access-token';
import type {SocketPairFetcher} from '../fetcher/socket-pair-fetch';

/** クライアントから渡されるデータ */
export type Data = {
  battleRoomID: BattleRoomID,
  command: Command,
};

/** ゲームが進んだ時のレスポンス */
export type ResponseWhenProgress = {
  update: GameState[]
};

/**
 * バトルルーム
 * 
 * @param socket イベント発火したソケット 
 * @param socketFetcher ソケット取得オブジェクト
 * @param battleRooms バトルルームコンテナ
 * @return イベントハンドラ 
 */
export const BattleRoom = (socket: typeof Socket, socketFetcher: SocketPairFetcher, battleRooms: AllBattleRooms): Function => async (data: Data) => {
  const token: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const room = battleRooms.battleRooms()
    .find(v => v.id === data.battleRoomID);
  if (!room) {
    socket.emit('error', 'invalid battle room');
    return;
  }

  const result = room.battleRoom.inputCommand(token.sessionID, data.command);
  if (result.type === 'Waiting') {
    socket.emit('Waiting');
    return;
  }

  const roomPlayers = room.battleRoom.roomPlayers();
  const resp: ResponseWhenProgress = {update: result.update};
  
  const sessionIDPair = [roomPlayers[0].sessionID, roomPlayers[1].sessionID];
  const sockets = await socketFetcher.fetchPair(sessionIDPair);
  sockets.forEach(v => {
    v.emit('Progress', resp);
  });
};