// @flow

import {Socket, Server} from 'socket.io';
import {BattleRoom, createRoomPlayer, extractPlayerAndEnemy} from "@gbraver-burst-network/core";
import type {BattleRoomAdd, BattleRoomID, EnterWaitingRoom, Session} from "@gbraver-burst-network/core";
import type {ArmDozerId, PilotId, Player, GameState} from 'gbraver-burst-core';
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
  const session = (socket.gbraverBurstSession: Session);
  const entry = {sessionID: session.id, armdozerId: data.armdozerId, pilotId: data.pilotId};
  const result = await waitingRoom.enter(entry);
  if (result.type === 'Waiting') {
    await socket.join(ioWaitingRoom());
    socket.emit('Waiting');
    return;
  }

  const myEntry = result.entries.find(v => v.sessionID === session.id);
  const otherEntry = result.entries.find(v => v !== myEntry);
  if (!myEntry || !otherEntry) {
    socket.emit('error', 'not found other entry');
    return;
  }

  const waitingRoomSockets = await io.in(ioWaitingRoom()).fetchSockets();
  const otherSocket = waitingRoomSockets.find(v => {
    const otherSession = (v.gbraverBurstSession: Session);
    return otherSession.id === otherEntry.sessionID;
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
    const session = (v.gbraverBurstSession: Session);
    const extractResult = extractPlayerAndEnemy(session.id, battleRoom.roomPlayers());
    const resp: ResponseWhenMatching = {battleRoomID: pair.id, initialState, player: extractResult.player, enemy: extractResult.enemy};
    v.emit('Matching', resp);
  });
}