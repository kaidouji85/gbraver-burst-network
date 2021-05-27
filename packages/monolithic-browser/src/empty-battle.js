// @flow

import type {Battle} from "@gbraver-burst-network/core";
import type {Command, GameState, Player} from "gbraver-burst-core";
import {ArmDozerIdList, ArmDozers, PilotIds, Pilots} from "gbraver-burst-core";

/**
 * 空のバトルを生成する
 *
 * @return 生成結果
 */
export function emptyBattle(): Battle {
  const shinBraver = ArmDozers.find(v => v.id === ArmDozerIdList.SHIN_BRAVER)
    ?? ArmDozers[0];
  const neoLandozer = ArmDozers.find(v => v.id === ArmDozerIdList.NEO_LANDOZER)
    ?? ArmDozers[0];
  const shinya = Pilots.find(v => v.id === PilotIds.SHINYA)
    ?? Pilots[0];
  const gai = Pilots.find(v => v.id === PilotIds.GAI)
    ?? Pilots[0];

  const player: Player = {
    playerId: 'player',
    armdozer: shinBraver,
    pilot: shinya
  };
  const enemy: Player = {
    playerId: 'enemy',
    armdozer: neoLandozer,
    pilot: gai
  };

  return {
    player: player,
    enemy: enemy,
    initialState: [],
    progress: (command: Command): Promise<GameState[]> => {
      console.log(command);
      return Promise.resolve([]);
    }
  };
}