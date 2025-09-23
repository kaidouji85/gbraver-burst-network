import { ArmdozerId, PilotId } from "gbraver-burst-core";

/** 状態なし */
export type NoState = {
  type: "NoState";
};

/** マッチメイク中 */
export type MatchMaking = {
  type: "MatchMaking";
  /** アームドーザID */
  armdozerId: ArmdozerId;
  /** パイロットID */
  pilotId: PilotId;
};

/** コネクションのステート */
export type ConnectionState = NoState | MatchMaking;
