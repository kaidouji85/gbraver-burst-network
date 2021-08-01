// @flow

import {Socket, Server} from 'socket.io';
import type {LeaveWaitingRoom, BattleRoomRemove, BattleRoomFindByUserID, User} from "@gbraver-burst-network/core";
import {ioBattleRoomName} from "../room/room-name";
import {deleteIoRoom} from "../room/delete-room";

/** 本ハンドラが利用する待合室の機能 */
interface OwnWaitingRoom extends LeaveWaitingRoom {}

/** 本ハンドラが利用するバトルルームコンテナの機能 */
interface OwnBattleRooms extends BattleRoomRemove, BattleRoomFindByUserID {}

/**
 * コネクション接続切の際に呼ばれるハンドラ
 *
 * @param socket ソケット
 * @param io socket.ioサーバ
 * @param waitingRoom 待合室
 * @param battleRooms バトルルームコンテナ
 * @return ハンドラ
 */
export const Disconnect = (socket: typeof Socket, io: typeof Server, waitingRoom: OwnWaitingRoom, battleRooms: OwnBattleRooms): Function => async  (): Promise<void> => {
  try {
    const user = (socket.gbraverBurstUser: User);
    await waitingRoom.leave(user.id);
    const battleRoom = battleRooms.findByUserID(user.id);
    if (battleRoom) {
      const ioRoomName = ioBattleRoomName(battleRoom.id);
      io.in(ioRoomName).emit('error', 'battle room end');
      await deleteIoRoom(io, ioRoomName);
      battleRooms.remove(battleRoom.id);
    }
  } catch(err) {
    socket.emit('error', 'disconnect error');
    console.error(err);
  }
}