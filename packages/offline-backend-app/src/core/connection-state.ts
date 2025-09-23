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

/**
 * コネクションのステート
 * 主にMapなどで管理する際に使用する
 */
export type ConnectionState = NoState | MatchMaking;

/**
 * ソケットID付きコネクションのステート
 * 主に配列で管理する際に使用する
 */
export type ConnectionStateWithId = ConnectionState & { socketId: string };
