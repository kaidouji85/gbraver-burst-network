import { ArmdozerId, PilotId, Player } from "gbraver-burst-core";

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

/** バトル中 */
export type InBattle = SocketInfo & {
  type: "InBattle";
  /** ゲームでのステータス */
  player: Player;
};

/** コネクションのステート */
export type ConnectionState = NoState | MatchMaking | InBattle;
