import { ArmdozerId, PilotId, Player } from "gbraver-burst-core";

/** すべてのステートが持つソケット情報 */
type SocketInfo = {
  /** ソケットID */
  readonly socketId: string;
};

/** 状態なし */
export type NoState = SocketInfo & {
  type: "NoState";
};

/** マッチメイク中 */
export type MatchMaking = SocketInfo & {
  type: "MatchMaking";
  /** アームドーザID */
  readonly armdozerId: ArmdozerId;
  /** パイロットID */
  readonly pilotId: PilotId;
};

/** バトル中 */
export type InBattle = SocketInfo & {
  type: "InBattle";
  /** ゲームでのステータス */
  readonly player: Player;
  /** バトルID */
  readonly battleId: string;
};

/** コネクションのステート */
export type ConnectionState = NoState | MatchMaking | InBattle;
