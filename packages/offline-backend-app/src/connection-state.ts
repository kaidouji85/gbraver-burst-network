/** 状態なし */
export type NoState = {
  type: "NoState";
}

/** マッチメイク中 */
export type MatchMaking = {
  type: "MatchMaking";
}

/** コネクションのステート */
export type ConnectionState = NoState | MatchMaking;
