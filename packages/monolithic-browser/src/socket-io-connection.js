// @flow

import io from 'socket.io-client';

/**
 * socket.io コネクションを生成する
 *
 * @param apiServerURL APIサーバのURL
 * @param accessToken アクセストークン
 * @return socket.io コネクション
 */
export function socketIoConnection(apiServerURL: string, accessToken: string): typeof io.Socket {
  return io(apiServerURL, {
    auth: {
      token: accessToken
    }
  });
}