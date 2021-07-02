// @flow
import {Socket, Server} from 'socket.io';
import type {LeaveWaitingRoom, BattleRoomRemove, BattleRoomFindBySessionID} from "@gbraver-burst-network/core";
import type {AccessTokenPayload} from "../../auth/access-token";
import {ioWaitingRoom, ioBattleRoom as getIoBattleRoom} from "../room/room-name";
import type {BattleRoomID} from "@gbraver-burst-network/core/src/battle-room/battle-room-container";

/** 本ハンドラが利用する待合室の機能 */
interface OwnWaitingRoom extends LeaveWaitingRoom {}

/** 本ハンドラが利用するバトルルームコンテナの機能 */
interface OwnBattleRooms extends BattleRoomRemove, BattleRoomFindBySessionID {}

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
  const payload: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const leaveWaitingRoom = async () => {
    await Promise.all([
      waitingRoom.leave(payload.sessionID),
      socket.leave(ioWaitingRoom())
    ]);
  };
  const removeBattleRoom = async (roomID: BattleRoomID) => {
    const ioBattleRoom = getIoBattleRoom(roomID);
    const roomSockets = await io.in(ioBattleRoom).fetchSockets();
    roomSockets.forEach(v => {
      v.leave(ioBattleRoom);
      v.emit('error', 'battle room end')
    });
    battleRooms.remove(roomID);
  };

  await leaveWaitingRoom();
  const pair = battleRooms.findBySessionID(payload.sessionID);
  pair && await removeBattleRoom(pair.id);
}