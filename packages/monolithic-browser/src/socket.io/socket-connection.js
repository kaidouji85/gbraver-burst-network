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
    try {
      const success = fn(this._socket)
        .then(resp => ({isSuccess: true, resp}));
      const errorOccuere = new Promise(resolve => {
        this._socket.once('error', resolve)
      }).then(error => ({isSuccess: false,error}));
      const result = await Promise.race([success, errorOccuere]);
      if (!result.isSuccess) {
        throw result.error;
      }
      return result.resp;
    } finally {
      this._socket.removeAllListeners();
    }
  }

  /**
   * socket.ioコネクションを切断する
   */
  close(): void {
    this._socket.close();
  }
}