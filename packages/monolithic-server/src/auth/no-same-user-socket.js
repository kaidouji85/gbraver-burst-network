// @flow

import {Server, Socket} from "socket.io";
import type {User} from "../users/user";

/**
 * 同一ユーザが複数接続しているか否かをチェック
 * 複数接続している場合はエラーになる
 * 本ミドルウェアはloginOnlyForSocketIOが処理された後に呼ばれる想定である
 *
 * @param io socket.ioサーバ
 * @return socket.ioミドルウェア
 */
export const noSameUserSocket = (io: typeof Server): Function => async (socket: typeof Socket, next: Function): Promise<void> => {
  try {
    const user = (socket.gbraverBurstUser: User);
    const sockets = await io.fetchSockets();
    const sameUser = sockets.filter(v => v !== socket)
      .map(v => (v.gbraverBurstUser: User))
      .find(v => v.id === user.id);
    sameUser
      ? next(new Error('same user socket already exist'))
      : next();
  } catch(e) {
    next(new Error('error in no same user socket checking'));
    console.error(e);
  }
};