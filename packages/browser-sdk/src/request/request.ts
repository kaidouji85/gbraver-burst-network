import type { BattleProgressPolling } from "./battle-progress-polling";
import { CreatePrivateMatchRoom } from "./create-private-match-room";
import type { EnterCasualMatch } from "./enter-casual-match";
import { EnterPrivateMatchRoom } from "./enter-private-match-room";
import { EnterRematch } from "./enter-rematch";
import type { Ping } from "./ping";
import { PrivateMatchMakePolling } from "./private-match-make-polling";
import { RematchMakePolling } from "./rematch-make-polling";
import type { SendCommand } from "./send-command";

/** APIサーバへのリクエスト */
export type APIServerRequest =
  | Ping
  | EnterCasualMatch
  | SendCommand
  | BattleProgressPolling
  | CreatePrivateMatchRoom
  | EnterPrivateMatchRoom
  | PrivateMatchMakePolling
  | EnterRematch
  | RematchMakePolling;
