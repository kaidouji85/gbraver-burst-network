
import { AcceptCommand } from "./accept-command";
import { BattleStart } from "./battle-start";
import { EnteredCasualMatch } from "./entered-casual-match";
import { NotReadyBattleProgress } from "./not-ready-battle-progress";
import { Pong } from "./pong";
import { BattleProgressed } from "./battle-progressed";
import { SuddenlyBattleEnd } from "./suddenly-battle-end";
import { BattleEnd } from "./battle-end";
import { CreatedPrivateMatchRoom } from "./created-private-match-room";
import { CouldNotPrivateMatchMaking } from "./cloud-not-private-match-make";
import { RejectPrivateMatchEntry } from "./reject-private-match-entry";

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

/** エラー */
export type Error = {
  action: "error";
  /* eslint-disable @typescript-eslint/no-explicit-any */
  error: any;
  /* eslint-enable */
};
