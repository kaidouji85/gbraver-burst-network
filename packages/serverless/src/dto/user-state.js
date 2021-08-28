// @flow

import type {BattleID} from "./battle";

/** ユーザの状態 */
export type UserState = None | CasualMatchMaking | InBattle;

/** 状態なし */
export type None = {
  type: 'None'
};
/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: 'CasualMatchMaking'
};

/** 戦闘中 */
export type InBattle = {
  type: 'InBattle',
  battleID: BattleID
};