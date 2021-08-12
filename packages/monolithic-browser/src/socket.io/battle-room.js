// @flow

import {Socket} from 'socket.io-client';
import type {GameState, Command} from 'gbraver-burst-core';

/** サーバに送信するデータ */
export type Data = {
  battleRoomID: string,
  command: Command,
};

/** ゲームが進んだ時にサーバから返されるデータ */
export type ResponseWhenProgress = {
  update: GameState[]
};

/**
 * バトルルームの処理
 * 
 * @param socket 通信をするソケット
 * @param battleRoomID バトルルームのID
 * @param command コマンド
 * @return ゲーム進行結果
 */
export function battleRoom(socket: typeof Socket, battleRoomID: string, command: Command): Promise<ResponseWhenProgress> {
  return new Promise(resolve => {
    const data: Data = {battleRoomID, command};
    socket.emit('BattleRoom', data);
    socket.once('Progress', (resp: ResponseWhenProgress) => {
      resolve(resp);
    });
  });
}