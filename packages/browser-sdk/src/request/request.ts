import type { BattleProgressPolling } from "./battle-progress-polling";
import type { EnterCasualMatch } from "./enter-casual-match";
import type { Ping } from "./ping";
import type { SendCommand } from "./send-command";

/** APIサーバへのリクエスト */
export type APIServerRequest =
  | Ping
  | EnterCasualMatch
  | SendCommand
  | BattleProgressPolling;
