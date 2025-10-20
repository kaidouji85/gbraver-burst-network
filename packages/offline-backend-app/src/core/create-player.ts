import {
  ArmdozerId,
  Armdozers,
  PilotId,
  Pilots,
  Player,
} from "gbraver-burst-core";
import { v4 as uuidv4 } from "uuid";

/**
 * ゲームに参加するプレイヤー情報を生成する
 * @param options オプション
 * @param options.armdozerId アームドーザID
 * @param options.pilotId パイロットID
 * @returns 生成されたプレイヤー情報
 */
export function createPlayer(options: {
  armdozerId: ArmdozerId;
  pilotId: PilotId;
}): Player {
  const armdozer =
    Armdozers.find((a) => a.id === options.armdozerId) ?? Armdozers[0];
  const pilot = Pilots.find((p) => p.id === options.pilotId) ?? Pilots[0];
  return {
    playerId: uuidv4(),
    armdozer,
    pilot,
  };
}
