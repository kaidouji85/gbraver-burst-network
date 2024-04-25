import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { z } from "zod";

import { PrivateMatchRoomID } from "../core/private-match-room";

/** プライベートマッチルームエントリ */
export type EnterPrivateMatchRoom = {
  action: "enter-private-match-room";
  /** ルームID */
  roomID: PrivateMatchRoomID;
  /** 選択したアームドーザID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
};

/** プライベートマッチルームエントリ zodスキーマ */
export const EnterPrivateMatchRoomSchema = z.object({
  action: z.literal("enter-private-match-room"),
  roomID: z.string(),
  armdozerId: z.string(),
  pilotId: z.string(),
});

/**
 * EnterPrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @returns パース結果
 */
export function parseEnterPrivateMatchRoom(
  origin: unknown,
): EnterPrivateMatchRoom | null {
  const result = EnterPrivateMatchRoomSchema.safeParse(origin);
  return result.success ? result.data : null;
}
