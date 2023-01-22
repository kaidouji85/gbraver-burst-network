import { Command } from "gbraver-burst-core";

import { BattleID, FlowID } from "./battle";
import { UserID } from "./user";

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
