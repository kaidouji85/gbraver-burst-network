// @flow

import type {Pong} from "./pong";
import type {BattleStart} from "./battle-start";
import type {EnteredCasualMatch} from "./entered-casual-match";
import type {AcceptCommand} from "./accept-command";
import type {NotReadyBattleProgress} from "./not-ready-battle-progress";
import type {BattleProgressed} from "./battle-progressed";
import type {SuddenlyBattleEnd} from "./suddenly-battle-end";
import type {BattleEnd} from "./battle-end";
import type {Error} from './error';

/** APIサーバからのレスポンス */
export type WebsocketAPIResponse =
  Pong |
  EnteredCasualMatch |
  AcceptCommand |
  BattleStart |
  NotReadyBattleProgress |
  BattleProgressed |
  BattleEnd |
  SuddenlyBattleEnd |
  Error;
