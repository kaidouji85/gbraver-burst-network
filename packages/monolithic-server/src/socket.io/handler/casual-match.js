// @flow

import {Socket} from 'socket.io';
import {WaitingRoom, BattleRoom, createRoomPlayer} from "@gbraver-burst-network/core";
import type {BattleRoomAdd, BattleRoomID, RoomPlayer} from "@gbraver-burst-network/core";
import type {ArmDozerId, PilotId} from 'gbraver-burst-core';
import type {AccessTokenPayload} from "../../auth/access-token";
import type {SocketPairFetcher} from "../fetcher/socket-pair-fetch";

/** クライアントから送信されるデータ */
export type Data = {
  armdozerId: ArmDozerId,
  pilotId: PilotId,
};

/** マッチングした際のレスポンス */
export type ResponseWhenMatching = {
  battleRoomID: BattleRoomID,
  roomPlayers: RoomPlayer[],
};

/**
 * カジュアルマッチ
 *
 * @param socket イベント発火したソケット
 * @param socketFetcher ソケット取得オブジェクト
 * @param waitingRoom 待合室
 * @param battleRooms バトルルームコンテナ
 * @return socket.ioのハンドラ
 */
export const CasualMatch = (socket: typeof Socket, socketFetcher: SocketPairFetcher, waitingRoom: WaitingRoom, battleRooms: BattleRoomAdd): Function => async (data: Data): Promise<void> => {
  const payload: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const entry = {sessionID: payload.sessionID, armdozerId: data.armdozerId, pilotId: data.pilotId};
  const result = await waitingRoom.enter(entry);
  if (result.type === 'Waiting') {
    socket.emit('Waiting');
    return;
  }

  const playersArray = result.entries.map(v => createRoomPlayer(v));
  const roomPlayers = [playersArray[0], playersArray[1]];
  const battleRoom = new BattleRoom(roomPlayers);
  const battleRoomID = battleRooms.add(battleRoom);
  const resp: ResponseWhenMatching = {roomPlayers, battleRoomID};

  const sessionIDPair = [result.entries[0].sessionID, result.entries[1].sessionID];
  const sockets = await socketFetcher.fetchPair(sessionIDPair);
  sockets.forEach(v => {
    v.emit('Matching', resp);
  });
}