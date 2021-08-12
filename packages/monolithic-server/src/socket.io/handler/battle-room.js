// @flow

import {Socket, Server} from 'socket.io';
import type {Command, GameState} from 'gbraver-burst-core';
import {ioBattleRoomName} from "../room/room-name";
import type {BattleRoomFind, BattleRoomID, BattleRoomRemove} from "../../battle-room/battle-room-container";
import type {User} from "../../users/user";

/** クライアントから渡されるデータ */
export type Data = {
  battleRoomID: BattleRoomID,
  command: Command,
};

/** ゲームが進んだ時のレスポンス */
export type ResponseWhenProgress = {
  update: GameState[]
};

/** 本ハンドラで利用するバトルルームの機能 */
interface OwnBattleRoom extends BattleRoomFind, BattleRoomRemove {}

/**
 * バトルルーム
 * 
 * @param socket イベント発火したソケット 
 * @param io socket.ioサーバ
 * @param battleRooms バトルルームコンテナ
 * @return イベントハンドラ 
 */
export const BattleRoom = (socket: typeof Socket, io: typeof Server, battleRooms: OwnBattleRoom): Function => async (data: Data): Promise<void> => {
  try {
    const user = (socket.gbraverBurstUser: User);
    const pair = battleRooms.find(data.battleRoomID);
    if (!pair) {
      socket.emit('error', 'invalid battle room');
      return;
    }

    const result = pair.battleRoom.inputCommand(user.id, data.command);
    if (result.type === 'Waiting') {
      socket.emit('Waiting');
      return;
    }

    const resp: ResponseWhenProgress = {update: result.update};
    const ioBattleRoom = ioBattleRoomName(data.battleRoomID);
    await io.in(ioBattleRoom).emit('Progress', resp);
    const lastState = result.update[result.update.length - 1];
    if (lastState.effect.name !== 'GameEnd') {
      return;
    }

    battleRooms.remove(data.battleRoomID);
    const sockets = await io.in(ioBattleRoom).fetchSockets();
    await Promise.all(
      sockets.map(v => v.leave(ioBattleRoom))
    );
  } catch(err) {
    socket.emit('error', 'battle room error');
    console.error(err);
  }
};