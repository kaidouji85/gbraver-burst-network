// @flow

import type {Pong} from "./pong";
import type {StartBattle} from "./start-battle";

/** APIサーバからのレスポンス */
export type WebsocketAPIResponse = Pong | StartBattle;
