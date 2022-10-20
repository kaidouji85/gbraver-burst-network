// @flow

import type { Ping } from "./ping";
import type { EnterCasualMatch } from "./enter-casual-match";
import type { SendCommand } from "./send-command";
import type { BattleProgressPolling } from "./battle-progress-polling";

/** APIサーバへのリクエスト */
export type APIServerRequest =
  | Ping
  | EnterCasualMatch
  | SendCommand
  | BattleProgressPolling;
