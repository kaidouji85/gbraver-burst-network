// @flow

import {Socket} from 'socket.io';
import {WaitingRoom, BattleRoom, createRoomPlayer, extractPlayerAndEnemy} from "@gbraver-burst-network/core";
import type {BattleRoomAdd, BattleRoomID} from "@gbraver-burst-network/core";
import type {ArmDozerId, PilotId, Player, GameState} from 'gbraver-burst-core';
import type {AccessTokenPayload} from "../../auth/access-token";
import type {FetchSocketPair} from "../fetcher/fetch-socket-pair";

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
 * @param socketFetcher ソケット取得オブジェクト
 * @param waitingRoom 待合室
 * @param battleRooms バトルルームコンテナ
 * @return socket.ioのハンドラ
 */
export const CasualMatch = (socket: typeof Socket, socketFetcher: FetchSocketPair, waitingRoom: WaitingRoom, battleRooms: BattleRoomAdd): Function => async (data: Data): Promise<void> => {
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
  const initialState = battleRoom.stateHistory();

  const sessionIDPair = [result.entries[0].sessionID, result.entries[1].sessionID];
  const sockets = await socketFetcher.fetchPair(sessionIDPair);
  sockets.forEach(v => {
    const payload: AccessTokenPayload = v.gbraverBurstAccessToken;
    const extractResult = extractPlayerAndEnemy(payload.sessionID, battleRoom.roomPlayers());
    const resp: ResponseWhenMatching = {battleRoomID, initialState, player: extractResult.player, enemy: extractResult.enemy};
    v.emit('Matching', resp);
  });
}