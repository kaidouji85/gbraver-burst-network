// @flow

import {Socket} from 'socket.io-client';
import type {BattleRoomID} from '@gbraver-burst-network/core';
import type {ArmDozerId, PilotId, GameState, Player} from "gbraver-burst-core";

/** サーバに送信するデータ */
export type Data = {
  armdozerId: ArmDozerId,
  pilotId: PilotId,
};

/** マッチング時にサーバから送信されるデータ */
export type ResponseWhenMatching = {
  battleRoomID: BattleRoomID,
  initialState: GameState[],
  player: Player,
  enemy: Player,
};

/**
 * カジュアルマッチを開始する
 *
 * @param socket カジュアルマッチを開始するソケット
 * @param armdozerID 選択したアームドーザID
 * @param pilotId 選択したパイロットID
 * @return マッチング情報
 */
export function casualMatch(socket: typeof Socket, armdozerID: ArmDozerId, pilotId: PilotId): Promise<ResponseWhenMatching> {
  return new Promise((resolve, reject) => {
    const data: Data = {armdozerId: armdozerID, pilotId: pilotId};
    socket.emit('CasualMatch', data);
    socket.once('Matching', (resp: ResponseWhenMatching) => {
      resolve(resp);
    });
    socket.on('error', err => {
      reject(err);
    });
  }).finally(() => {
    socket.removeAllListeners();
  });
}