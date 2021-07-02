// @flow

import {Socket, Server} from 'socket.io';
import type {Command, GameState} from 'gbraver-burst-core';
import type {BattleRoomFind, BattleRoomRemove, BattleRoomID} from '@gbraver-burst-network/core';
import type {AccessTokenPayload} from '../../auth/access-token';
import {ioBattleRoom as getIoBattleRoom} from "../room/room-name";

/** クライアントから渡されるデータ */
export type Data = {
  battleRoomID: BattleRoomID,
  command: Command,
};

/** ゲームが進んだ時のレスポンス */
export type ResponseWhenProgress = {
  update: GameState[]
};

/** 本ハンドラで利用するバトルルームの機能 */
interface OwnBattleRoom extends BattleRoomFind, BattleRoomRemove {}

/**
 * バトルルーム
 * 
 * @param socket イベント発火したソケット 
 * @param io socket.ioサーバ
 * @param battleRooms バトルルームコンテナ
 * @return イベントハンドラ 
 */
export const BattleRoom = (socket: typeof Socket, io: typeof Server, battleRooms: OwnBattleRoom): Function => async (data: Data) => {
  const token: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const pair = battleRooms.find(data.battleRoomID);
  if (!pair) {
    socket.emit('error', 'invalid battle room');
    return;
  }

  const result = pair.battleRoom.inputCommand(token.sessionID, data.command);
  if (result.type === 'Waiting') {
    socket.emit('Waiting');
    return;
  }

  const resp: ResponseWhenProgress = {update: result.update};
  const ioBattleRoom = getIoBattleRoom(data.battleRoomID);
  const sockets = await io.in(ioBattleRoom).fetchSockets();
  sockets.forEach(v => {
    v.emit('Progress', resp);
  });

  const lastState = result.update[result.update.length - 1];
  if (lastState.effect.name !== 'GameEnd') {
    return;
  }

  battleRooms.remove(data.battleRoomID);
  sockets.forEach(v => {
    v.leave(ioBattleRoom);
  });
};