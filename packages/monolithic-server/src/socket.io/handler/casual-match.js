// @flow

import {Socket, Server} from 'socket.io';
import {WaitingRoom, BattleRoom, createRoomPlayer, extractPlayerAndEnemy} from "@gbraver-burst-network/core";
import type {BattleRoomAdd, BattleRoomID} from "@gbraver-burst-network/core";
import type {ArmDozerId, PilotId, Player, GameState} from 'gbraver-burst-core';
import type {AccessTokenPayload} from "../../auth/access-token";
import {ioBattleRoom as getIoBattleRoom, ioWaitingRoom} from '../room/room-name';

/** クライアントから送信されるデータ */
export type Data = {
  armdozerId: ArmDozerId,
  pilotId: PilotId,
};

/** マッチングした際のレスポンス */
export type ResponseWhenMatching = {
  battleRoomID: BattleRoomID,
  initialState: GameState[],
  player: Player,
  enemy: Player,
};

/**
 * カジュアルマッチ
 * マッチングしたら、ルーム生成、初期ゲームステート生成まで進める
 *
 * @param socket イベント発火したソケット
 * @param io sockt.ioサーバ
 * @param waitingRoom 待合室
 * @param battleRooms バトルルームコンテナ
 * @return socket.ioのハンドラ
 */
export const CasualMatch = (socket: typeof Socket, io: typeof Server, waitingRoom: WaitingRoom, battleRooms: BattleRoomAdd): Function => async (data: Data): Promise<void> => {
  const payload: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const entry = {sessionID: payload.sessionID, armdozerId: data.armdozerId, pilotId: data.pilotId};
  const result = await waitingRoom.enter(entry);
  if (result.type === 'Waiting') {
    socket.join(ioWaitingRoom());
    socket.emit('Waiting');
    return;
  }

  const myEntry = result.entries.find(v => v.sessionID === payload.sessionID);
  const otherEntry = result.entries.find(v => v !== myEntry);
  if (!myEntry || !otherEntry) {
    socket.emit('error', 'not found other entry');
    return;
  }

  const waitingRoomSockets = await io.in(ioWaitingRoom()).fetchSockets();
  const otherSocket = waitingRoomSockets.find(v => {
    const othrPayload: AccessTokenPayload = v.gbraverBurstAccessToken;
    return othrPayload.sessionID === otherEntry.sessionID;
  });
  if (!otherSocket) {
    socket.emit('error', 'not found other socket');
    return;
  }
  otherSocket.leave(ioWaitingRoom());

  const roomPlayers = [createRoomPlayer(myEntry), createRoomPlayer(otherEntry)];
  const battleRoom = new BattleRoom(roomPlayers);
  const battleRoomID = battleRooms.add(battleRoom);
  const initialState = battleRoom.stateHistory();
  const sockets = [socket, otherSocket];
  const ioBattleRoom = getIoBattleRoom(battleRoomID);
  sockets.forEach(v => {
    const payload: AccessTokenPayload = v.gbraverBurstAccessToken;
    const extractResult = extractPlayerAndEnemy(payload.sessionID, battleRoom.roomPlayers());
    const resp: ResponseWhenMatching = {battleRoomID, initialState, player: extractResult.player, enemy: extractResult.enemy};
    v.join(ioBattleRoom);
    v.emit('Matching', resp);
  });
}