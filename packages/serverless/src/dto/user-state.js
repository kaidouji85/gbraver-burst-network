// @flow

/** ユーザの状態 */
export type UserState = None | CasualMatchMaking;

/** 状態なし */
export type None = {
  type: 'None'
};
/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: 'CasualMatchMaking'
};