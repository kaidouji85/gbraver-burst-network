import { PlayerId, PlayerIdSchema } from "gbraver-burst-core";
import { z } from "zod";

import { BattleID, BattleIDSchema } from "../../battle/battle";
import { UserID, UserIDSchema } from "../../user";

/** バトルに参加しているプレイヤー */
export type InBattlePlayer = {
  /** ユーザID */
  userID: UserID;
  /** プレイヤーID */
  playerId: PlayerId;
  /** コネクションID */
  connectionId: string;
};

/** InBattlePlayer zodスキーマ */
export const InBattlePlayerSchema = z.object({
  userID: UserIDSchema,
  playerId: PlayerIdSchema,
  connectionId: z.string(),
});

/** 戦闘中 */
export type InBattle = {
  type: "InBattle";
  /** 現在実行している戦闘のID */
  battleID: BattleID;
  /** バトルに参加しているプレイヤーの情報 */
  players: [InBattlePlayer, InBattlePlayer];
};

/** InBattle zodスキーマ */
export const InBattleSchema = z.object({
  type: z.literal("InBattle"),
  battleID: BattleIDSchema,
  players: z.tuple([InBattlePlayerSchema, InBattlePlayerSchema]),
});
