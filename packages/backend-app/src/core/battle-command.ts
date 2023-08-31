import { Command, CommandSchema } from "gbraver-burst-core";
import { z } from "zod";

import { BattleID, BattleIDSchema, FlowID, FlowIDSchema } from "./battle";
import { UserID, UserIDSchema } from "./user";

/** バトルコマンド */
export type BattleCommand = {
  /** ユーザID */
  userID: UserID;
  /** バトルID */
  battleID: BattleID;
  /** フローID */
  flowID: FlowID;
  /** コマンド */
  command: Command;
};

/** BattleCommand zodスキーマ */
export const BattleCommandSchema = z.object({
  userID: UserIDSchema,
  battleID: BattleIDSchema,
  flowID: FlowIDSchema,
  command: CommandSchema,
});