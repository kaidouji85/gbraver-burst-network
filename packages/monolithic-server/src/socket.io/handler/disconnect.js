// @flow

import {Socket, Server} from 'socket.io';
import type {LeaveWaitingRoom, BattleRoomRemove, BattleRoomID, BattleRoomFindByUserID, User} from "@gbraver-burst-network/core";
import {ioWaitingRoom, ioBattleRoom as getIoBattleRoom} from "../room/room-name";

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
    const leaveWaitingRoom = async () => {
      await Promise.all([
        waitingRoom.leave(user.id),
        socket.leave(ioWaitingRoom())
      ]);
    };
    const removeBattleRoom = async (roomID: BattleRoomID) => {
      const ioBattleRoom = getIoBattleRoom(roomID);
      io.in(ioBattleRoom).emit('error', 'battle room end');
      const roomSockets = await io.in(ioBattleRoom).fetchSockets();
      await Promise.all(
        roomSockets.map(v => v.leave(ioBattleRoom))
      );
      battleRooms.remove(roomID);
    };

    await leaveWaitingRoom();
    const pair = battleRooms.findByUserID(user.id);
    if (pair) {
      await removeBattleRoom(pair.id);
    }
  } catch(err) {
    socket.emit('error', 'disconnect error');
    console.error(err);
  }
}