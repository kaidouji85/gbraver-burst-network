// @flow

import type {UserID} from "../user";
import type {Player} from "gbraver-burst-core";
import type {ArmDozerId, PilotId} from "gbraver-burst-core";
import {ArmDozers, Pilots} from "gbraver-burst-core";
import { v4 as uuidv4 } from 'uuid';

/** 入室しているユーザの情報 */
export type RoomUser = {
  /** ユーザID */
  userID: UserID,
  /** ユーザのプレイヤー情報 */
  player: Player,
}

/**
 * 入室ユーザを生成する
 * 生成失敗した場合はnullを返す
 *
 * @param userID ユーザID
 * @param armdozerId アームドーザID
 * @param pilotId パイロイットID
 * @return 生成結果
 */
export function createRoomUser(userID: UserID, armdozerId: ArmDozerId, pilotId: PilotId): ?RoomUser {
  const armdozer = ArmDozers.find(v => v.id === armdozerId);
  const pilot = Pilots.find(v => v.id === pilotId);
  if (!armdozer || !pilot) {
    return null;
  }

  const player = {playerId: uuidv4(), armdozer, pilot};
  return {userID: userID, player};
}