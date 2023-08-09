import { z } from "zod";

import { PrivateMatchRoomID } from "../core/private-match-room";

/** プライベートルームマッチポーリング */
export type PrivateMatchMakePolling = {
  action: "private-match-make-polling";
  /** ルームID */
  roomID: PrivateMatchRoomID;
};

/** プライベートルームマッチポーリング zodスキーマ */
export const privateMatchMakePollingSchema: z.ZodSchema<PrivateMatchMakePolling> = 
  z.object({
    action: z.literal("private-match-make-polling"),
    roomID: z.string(),
  });

/**
 * PrivateMatchMakePollingにパースする
 * パースできない場合、nullを返す
 * @param origin パース元
 * @return パース結果
 */
export function parsePrivateMatchMakePolling(
  origin: unknown,
): PrivateMatchMakePolling | null {
  const result = privateMatchMakePollingSchema.safeParse(origin);
  return result.success ? result.data : null;
}
