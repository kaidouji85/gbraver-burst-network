// @flow

import {Socket} from 'socket.io';
import type {WaitingRoom} from "@gbraver-burst-network/core";
import type {AccessTokenPayload} from "../../auth/access-token";
import type {SocketPairFetcher} from "../fetcher/socket-pair-fetch";

/** クライアントから送信されるデータ */
export type Data = {
  armdozerId: string,
  pilotId: string,
};

/**
 * カジュアルマッチ
 *
 * @param socket イベント発火したソケット
 * @param socketFetcher ソケット取得オブジェクト
 * @param waitingRoom 待合室
 * @return socket.ioのハンドラ
 */
export const CasualMatch = (socket: typeof Socket, socketFetcher: SocketPairFetcher, waitingRoom: WaitingRoom): Function => async (data: Data): Promise<void> => {
  const payload: AccessTokenPayload = socket.gbraverBurstAccessToken;
  payload.sessionID
  const entry = {sessionID: payload.sessionID, armdozerId: data.armdozerId, pilotId: data.pilotId};
  const result = await waitingRoom.enter(entry);
  if (result.type === 'Waiting') {
    socket.emit('Waiting');
    return;
  }

  const sessionIDPair = [result.entries[0].sessionID, result.entries[1].sessionID];
  const sockets = await socketFetcher.fetchPair(sessionIDPair);
  sockets.forEach(v => {
    v.emit('Matching');
  });
}