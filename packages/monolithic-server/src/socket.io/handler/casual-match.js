// @flow

import {Socket, Server} from 'socket.io';
import {BattleRoom, createRoomPlayer, extractPlayerAndEnemy} from "@gbraver-burst-network/core";
import type {BattleRoomAdd, BattleRoomID, EnterWaitingRoom} from "@gbraver-burst-network/core";
import type {ArmDozerId, PilotId, Player, GameState} from 'gbraver-burst-core';
import {ioBattleRoom as getIoBattleRoom, ioWaitingRoom} from '../room/room-name';
import type {AccessTokenPayload} from "../../auth/access-token-payload";

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

/** 本ハンドラで利用する待合室の機能 */
interface OwnWaitingRoom extends EnterWaitingRoom {}

/** 本ハンドラで利用するバトルルームコンテナの機能 */
interface OwnBattleRooms extends BattleRoomAdd {}

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
export const CasualMatch = (socket: typeof Socket, io: typeof Server, waitingRoom: OwnWaitingRoom, battleRooms: OwnBattleRooms): Function => async (data: Data): Promise<void> => {
  const payload: AccessTokenPayload = socket.gbraverBurstAccessToken;
  const entry = {sessionID: payload.sessionID, armdozerId: data.armdozerId, pilotId: data.pilotId};
  const result = await waitingRoom.enter(entry);
  if (result.type === 'Waiting') {
    await socket.join(ioWaitingRoom());
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
    const otherPayload: AccessTokenPayload = v.gbraverBurstAccessToken;
    return otherPayload.sessionID === otherEntry.sessionID;
  });
  if (!otherSocket) {
    socket.emit('error', 'not found other socket');
    return;
  }

  await otherSocket.leave(ioWaitingRoom());
  const roomPlayers = [createRoomPlayer(myEntry), createRoomPlayer(otherEntry)];
  const battleRoom = new BattleRoom(roomPlayers);
  const pair = battleRooms.add(battleRoom);
  const initialState = battleRoom.stateHistory();
  const sockets = [socket, otherSocket];
  const ioBattleRoom = getIoBattleRoom(pair.id);
  await Promise.all(
    sockets.map(v => v.join(ioBattleRoom))
  );
  sockets.forEach(v => {
    const payload: AccessTokenPayload = v.gbraverBurstAccessToken;
    const extractResult = extractPlayerAndEnemy(payload.sessionID, battleRoom.roomPlayers());
    const resp: ResponseWhenMatching = {battleRoomID: pair.id, initialState, player: extractResult.player, enemy: extractResult.enemy};
    v.emit('Matching', resp);
  });
}