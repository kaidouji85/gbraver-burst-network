import type { AcceptCommand } from "./accept-command";
import type { BattleEnd } from "./battle-end";
import type { BattleProgressed } from "./battle-progressed";
import type { BattleStart } from "./battle-start";
import { CreatedPrivateMatchRoom } from "./created-private-match-room";
import type { EnteredCasualMatch } from "./entered-casual-match";
import { EnteredPrivateMatchRoom } from "./entered-private-match-room";
import type { Error } from "./error";
import type { NotReadyBattleProgress } from "./not-ready-battle-progress";
import type { Pong } from "./pong";
import type { SuddenlyBattleEnd } from "./suddenly-battle-end";

/** APIサーバからのレスポンス */
export type WebsocketAPIResponse =
  | Pong
  | EnteredCasualMatch
  | AcceptCommand
  | BattleStart
  | NotReadyBattleProgress
  | BattleProgressed
  | BattleEnd
  | SuddenlyBattleEnd
  | CreatedPrivateMatchRoom
  | EnteredPrivateMatchRoom
  | Error;
