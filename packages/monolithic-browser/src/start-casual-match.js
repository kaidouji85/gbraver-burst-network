// @flow

import {Socket} from 'socket.io-client';
import type {ArmDozerId, PilotId} from "gbraver-burst-core";

export function startCasualMatch(socket: typeof Socket, armdozerID: ArmDozerId, pilotId: PilotId): Promise<void> {
  return new Promise(resolve => {
    const data = {armdozerId: armdozerID, pilotId: pilotId};
    socket.emit('CasualMatch', data);
    socket.once('Matching', () => {
      resolve();
    });
  });
}