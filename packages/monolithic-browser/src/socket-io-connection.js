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
  return new Promise((resolve, reject) => {
    const socket = io(apiServerURL, {
      auth: {
        token: accessToken
      }
    });
    socket.on('connect', () => {
      resolve(socket);
    });
    socket.on('connect_error', reject);
  });
}