import type { BattleProgressPolling } from "./battle-progress-polling";
import { CreatePrivateMatchRoom } from "./create-private-match-room";
import type { EnterCasualMatch } from "./enter-casual-match";
import { EnterPrivateMatchRoom } from "./enter-private-match-room";
import type { Ping } from "./ping";
import type { SendCommand } from "./send-command";

/** APIサーバへのリクエスト */
export type APIServerRequest =
  | Ping
  | EnterCasualMatch
  | SendCommand
  | BattleProgressPolling
  | CreatePrivateMatchRoom
  | EnterPrivateMatchRoom;
