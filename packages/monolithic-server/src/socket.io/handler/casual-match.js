// @flow

import {Socket} from 'socket.io';
import type {WaitingRoom} from "@gbraver-burst-network/core";
import type {AccessTokenPayload} from "../../auth/access-token";

/** クライアントから送信されるデータ */
export type Data = {
  armdozerId: string,
  pilotId: string,
};

// TODO 全体への通知を作成する
/**
 * カジュアルマッチ
 *
 * @param socket ソケット
 * @param room 待合室
 * @return socket.ioのリスナ
 */
export const CasualMatch = (socket: typeof Socket, room: WaitingRoom): Function => async (data: Data): Promise<void> => {
  const payload: AccessTokenPayload = socket.gbraverBurstAccessToken;
  payload.sessionID
  const entry = {sessionID: payload.sessionID, armdozerId: data.armdozerId, pilotId: data.pilotId};
  const result = await room.enter(entry);
  if (result.type === 'Waiting') {
    socket.emit('Waiting');
    return;
  }

  socket.emit('Matching');
}