import { ArmDozerId, PilotId } from "gbraver-burst-core";

import { PrivateMatchRoomID } from "../core/private-match-room";

/** プライベートマッチルームエントリ */
export type EnterPrivateMatchRoom = {
  action: "enter-private-match-room";
  /** ルームID */
  roomID: PrivateMatchRoomID;
  /** 選択したアームドーザID */
  armdozerId: ArmDozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
};

/**
 * EnterPrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseEnterPrivateMatchRoom(
  origin: any
): EnterPrivateMatchRoom | null {
  /* eslint-enable */
  if (
    origin?.action === "enter-private-match-room" &&
    typeof origin?.roomID === "string" &&
    typeof origin?.armdozerId === "string" &&
    typeof origin?.pilotId === "string"
  ) {
    return {
      action: "enter-private-match-room",
      roomID: origin?.roomID,
      armdozerId: origin?.armdozerId,
      pilotId: origin?.pilotId,
    };
  }
  return null;
}
