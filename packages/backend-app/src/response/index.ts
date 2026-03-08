import { AcceptCommand } from "./accept-command";
import { BattleEnd } from "./battle-end";
import { BattleProgressed } from "./battle-progressed";
import { BattleStart } from "./battle-start";
import { CouldNotPrivateMatchMaking } from "./cloud-not-private-match-make";
import { CreatedPrivateMatchRoom } from "./created-private-match-room";
import { EnteredCasualMatch } from "./entered-casual-match";
import { Error } from "./error";
import { NotReadyBattleProgress } from "./not-ready-battle-progress";
import { Pong } from "./pong";
import { RejectPrivateMatchEntry } from "./reject-private-match-entry";
import { SuddenlyBattleEnd } from "./suddenly-battle-end";

/** websocketがクライアントに返すデータ */
export type WebsocketResponse =
  | Pong
  | EnteredCasualMatch
  | AcceptCommand
  | BattleStart
  | NotReadyBattleProgress
  | BattleProgressed
  | BattleEnd
  | SuddenlyBattleEnd
  | CreatedPrivateMatchRoom
  | CouldNotPrivateMatchMaking
  | RejectPrivateMatchEntry
  | Error;
