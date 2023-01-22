import { PlayerId } from "gbraver-burst-core";

import { BattleID } from "./battle";
import { UserID } from "./user";

/** コネクションの状態 */
export type ConnectionState = None | CasualMatchMaking | InBattle;

/** 状態なし */
export type None = {
  type: "None";
};

/** カジュアルマッチ マッチメイク中 */
export type CasualMatchMaking = {
  type: "CasualMatchMaking";
};

/** バトルに参加しているプレイヤー */
export type InBattlePlayer = {
  /** ユーザID */
  userID: UserID;

  /** プレイヤーID */
  playerId: PlayerId;

  /** コネクションID */
  connectionId: string;
};

/** 戦闘中 */
export type InBattle = {
  type: "InBattle";

  /** 現在実行している戦闘のID */
  battleID: BattleID;

  /** バトルに参加しているプレイヤーの情報 */
  players: [InBattlePlayer, InBattlePlayer];
};

/** WebsocketAPI コネクションステート */
export type Connection = {
  /** コネクションID */
  connectionId: string;

  /** ユーザID */
  userID: UserID;

  /** ステート */
  state: ConnectionState;
};