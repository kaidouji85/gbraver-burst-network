// @flow

import type { BattleProgressPolling } from "./battle-progress-polling";
import type { EnterCasualMatch } from "./enter-casual-match";
import type { Ping } from "./ping";
import type { SendCommand } from "./sned-command";

/** websocketのリクエストボディ */
export type WebsocketRequest =
  | Ping
  | EnterCasualMatch
  | SendCommand
  | BattleProgressPolling;
