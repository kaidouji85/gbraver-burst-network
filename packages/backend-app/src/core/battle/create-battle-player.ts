import { Armdozers, Pilots } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import { BattleEntry } from "../matching/battle-entry";
import type { BattlePlayer } from "./battle";

/**
 * BattleEntryからBattlePlayerを生成するヘルパー関数
 * @param entry エントリ
 * @returns 生成結果
 */
export function createBattlePlayer(entry: BattleEntry): BattlePlayer {
  const armdozer =
    Armdozers.find((v) => v.id === entry.armdozerId) ?? Armdozers[0];
  const pilot = Pilots.find((v) => v.id === entry.pilotId) ?? Pilots[0];
  return {
    playerId: uuidv4(),
    userID: entry.userID,
    connectionId: entry.connectionId,
    armdozer,
    pilot,
  };
}
