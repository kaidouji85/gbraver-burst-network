// @flow

import { ArmDozers, Pilots } from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

import type { PlayerSchema } from "./battles";
import type { CasualMatchEntriesSchema } from "./casual-match-entries";

/**
 * CasualMatchEntriesSchemaからPlayerSchemaを生成するヘルパー関数
 *
 * @param entry エントリ
 * @return 生成結果
 */
export function createPlayerSchema(
  entry: CasualMatchEntriesSchema
): PlayerSchema {
  const armdozer =
    ArmDozers.find((v) => v.id === entry.armdozerId) ?? ArmDozers[0];
  const pilot = Pilots.find((v) => v.id === entry.pilotId) ?? Pilots[0];
  return {
    playerId: uuidv4(),
    userID: entry.userID,
    connectionId: entry.connectionId,
    armdozer,
    pilot,
  };
}
