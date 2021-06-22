// @flow

import {Socket} from 'socket.io-client';
import type {GameState, Command} from 'gbraver-burst-core';
import type {BattleRoomID} from '@gbraver-burst-network/core';

/** サーバに送信するデータ */
export type Data = {
  battleRoomID: BattleRoomID,
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
export function battleRoom(socket: typeof Socket, battleRoomID: BattleRoomID, command: Command): Promise<ResponseWhenProgress> {
  return new Promise((resolve, reject) => {
    const data: Data = {battleRoomID, command};
    socket.emit('BattleRoom', data);
    socket.once('Progress', (resp: ResponseWhenProgress) => {
      resolve(resp);
    });
    socket.once('error', err => {
      reject(err);
    });
  }).finally(() => {
    socket.removeAllListeners();
  });
}