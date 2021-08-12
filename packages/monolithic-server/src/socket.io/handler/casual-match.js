// @flow

import {Socket, Server} from 'socket.io';
import type {ArmDozerId, PilotId, Player, GameState} from 'gbraver-burst-core';
import {ioBattleRoomName, ioWaitingRoomName} from '../room/room-name';
import type {BattleRoomAdd, BattleRoomID} from "../../battle-room/battle-room-container";
import type {EnterWaitingRoom} from "../../waiting-room/waiting-room";
import type {User} from "../../users/user";
import {extractPlayerAndEnemy} from "../../battle-room/extract-player-and-enemy";
import {BattleRoom} from "../../battle-room/battle-room";
import {createRoomPlayer} from "../../battle-room/create-room-player";

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
  try {
    const user = (socket.gbraverBurstUser: User);
    const entry = {userID: user.id, armdozerId: data.armdozerId, pilotId: data.pilotId};
    const result = await waitingRoom.enter(entry);
    if (result.type === 'Waiting') {
      await socket.join(ioWaitingRoomName());
      socket.emit('Waiting');
      return;
    }

    const myEntry = result.entries.find(v => v.userID === user.id);
    const otherEntry = result.entries.find(v => v !== myEntry);
    if (!myEntry || !otherEntry) {
      socket.emit('error', 'not found other entry');
      return;
    }

    const waitingRoomSockets = await io.in(ioWaitingRoomName()).fetchSockets();
    const otherSocket = waitingRoomSockets.find(v => {
      const otherUser = (v.gbraverBurstUser: User);
      return otherUser.id === otherEntry.userID;
    });
    if (!otherSocket) {
      socket.emit('error', 'not found other socket');
      return;
    }

    await otherSocket.leave(ioWaitingRoomName());
    const roomPlayers = [createRoomPlayer(myEntry), createRoomPlayer(otherEntry)];
    const battleRoom = new BattleRoom(roomPlayers);
    const pair = battleRooms.add(battleRoom);
    const initialState = battleRoom.stateHistory();
    const sockets = [socket, otherSocket];
    const ioBattleRoom = ioBattleRoomName(pair.id);
    await Promise.all(
      sockets.map(v => v.join(ioBattleRoom))
    );
    sockets.forEach(v => {
      const user = (v.gbraverBurstUser: User);
      const extractResult = extractPlayerAndEnemy(user.id, battleRoom.roomPlayers());
      const resp: ResponseWhenMatching = {battleRoomID: pair.id, initialState, player: extractResult.player, enemy: extractResult.enemy};
      v.emit('Matching', resp);
    });
  } catch(err) {
    socket.emit('error', 'casual match error');
    console.error(err);
  }
}