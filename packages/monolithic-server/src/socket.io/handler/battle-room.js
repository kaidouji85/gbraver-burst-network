// @flow

import {Socket} from 'socket.io';
import type {Command, GameState} from 'gbraver-burst-core';
import type {BattleRoomFind, BattleRoomRemove, BattleRoomID} from '@gbraver-burst-network/core';
import type {AccessTokenPayload} from '../../auth/access-token';
import type {FetchSocketPair} from '../fetcher/fetch-socket-pair';

/** クライアントから渡されるデータ */
export type Data = {
  battleRoomID: BattleRoomID,
  command: Command,
};

/** ゲームが進んだ時のレスポンス */
export type ResponseWhenProgress = {
  update: GameState[]
};

/** 本ハンドラで利用するセッション取得機能 */
interface OwnSocketFetcher extends FetchSocketPair {}

/** 本ハンドラで利用するバトルルームの機能 */
interface OwnBattleRoom extends BattleRoomFind, BattleRoomRemove {}

/**
 * バトルルーム
 * 
 * @param socket イベント発火したソケット 
 * @param socketFetcher ソケット取得オブジェクト
 * @param battleRooms バトルルームコンテナ
 * @return イベントハンドラ 
 */
export const BattleRoom = (socket: typeof Socket, socketFetcher: OwnSocketFetcher, battleRooms: OwnBattleRoom): Function => async (data: Data) => {
  const token: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const room = battleRooms.find(data.battleRoomID); 
  if (!room) {
    socket.emit('error', 'invalid battle room');
    return;
  }

  const result = room.inputCommand(token.sessionID, data.command);
  if (result.type === 'Waiting') {
    socket.emit('Waiting');
    return;
  }

  const lastState = result.update[result.update.length - 1];
  if (lastState.effect.name === 'GameEnd') {
    battleRooms.remove(data.battleRoomID);
  }

  const resp: ResponseWhenProgress = {update: result.update};
  const roomPlayers = room.roomPlayers();
  const sessionIDPair = [roomPlayers[0].sessionID, roomPlayers[1].sessionID];
  const sockets = await socketFetcher.fetchPair(sessionIDPair);
  if (!sockets) {
    socket.emit('error', 'not found room socket pair');
    return;
  }

  sockets.forEach(v => {
    v.emit('Progress', resp);
  });
};