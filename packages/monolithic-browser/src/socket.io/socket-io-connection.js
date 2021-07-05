// @flow

import io from 'socket.io-client';

/**
 * socket.io サーバに接続する
 *
 * @param apiServerURL APIサーバのURL
 * @param accessToken アクセストークン
 * @return socket.io コネクション
 */
export function startConnection(apiServerURL: string, accessToken: string): Promise<typeof io.Socket> {
  const socket = io(apiServerURL, {
    auth: {
      token: accessToken
    },
    forceNew: true
  });
  return new Promise((resolve, reject) => {
    socket.once('connect', () => {
      resolve(socket);
    });
    socket.once('connect_error', reject);
  }).finally(() => {
    socket.removeAllListeners();
  });
}

/** socket.ioコネクション管理 */
export class SocketConnection {
  _socket: typeof io.Socket;
  
  /**
   * コンストラクタ
   * 
   * @param socket socket.ioコネクション
   */
  constructor(socket: typeof io.Socket) {
    this._socket = socket;
  }

  /**
   * ソケット通信を行う
   * 通信前にサーバからエラーを受信した場合、
   * Promise.rejectを発生させる
   * 
   * @param fn 通信内容を定義するコールバック関数
   * @return コールバック関数の実行結果
   */
  async execute<X>(fn: (socket: typeof io.Socket) => Promise<X>): Promise<X> {
    const resp = await fn(this._socket);
    return resp;
  }
}