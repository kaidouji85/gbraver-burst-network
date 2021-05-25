// @flow

import io from 'socket.io-client';

/**
 * socket.io コネクションを生成する
 *
 * @param apiServerURL APIサーバのURL
 * @param accessToken アクセストークン
 * @return socket.io コネクション
 */
export function socketIoConnection(apiServerURL: string, accessToken: string): Promise<typeof io.Socket> {
  const socket = io(apiServerURL, {
    auth: {
      token: accessToken
    }
  });
  return new Promise((resolve, reject) => {
    socket.once('connect', () => {
      resolve(socket);
    });
    socket.once('connect_error', reject);
  }).finally(() => {
    ['connect', 'connect_error'].forEach(v => {
      socket.removeAllListeners(v);
    });
  });
}