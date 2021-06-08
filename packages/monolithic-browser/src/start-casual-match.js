// @flow

import {Socket} from 'socket.io-client';
import type {ArmDozerId, PilotId} from "gbraver-burst-core";

/**
 * カジュアルマッチを開始する
 *
 * @param socket カジュアルマッチを開始するソケット
 * @param armdozerID 選択したアームドーザID
 * @param pilotId 選択したパイロットID
 * @return 結果
 */
export function startCasualMatch(socket: typeof Socket, armdozerID: ArmDozerId, pilotId: PilotId): Promise<void> {
  return new Promise(resolve => {
    const data = {armdozerId: armdozerID, pilotId: pilotId};
    socket.emit('CasualMatch', data);
    socket.once('Matching', () => {
      resolve();
    });
  }).finally(() => {
    socket.removeAllListeners();
  });
}