import { ArmdozerId, PilotId } from "gbraver-burst-core";

/** すべてのステートが持つソケット情報 */
type SocketInfo = {
  /** ソケットID */
  socketId: string;
};

/** 状態なし */
export type NoState = SocketInfo & {
  type: "NoState";
};

/** マッチメイク中 */
export type MatchMaking = SocketInfo & {
  type: "MatchMaking";
  /** アームドーザID */
  armdozerId: ArmdozerId;
  /** パイロットID */
  pilotId: PilotId;
};

/** コネクションのステート */
export type ConnectionState = NoState | MatchMaking;
