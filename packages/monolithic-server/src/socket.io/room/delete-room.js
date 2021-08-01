// @flow

import {Server} from "socket.io";

/**
 * socket.ioルームを削除する
 *
 * @param io socket.ioサーバ
 * @param roomName 削除するルーム名
 * @return ルーム削除が完了したら発火するPromise
 */
export async function deleteIoRoom(io: typeof Server, roomName: string): Promise<void> {
  const roomSockets = await io.in(roomName).fetchSockets();
  await Promise.all(
    roomSockets.map(v => v.leave(roomName))
  );
}