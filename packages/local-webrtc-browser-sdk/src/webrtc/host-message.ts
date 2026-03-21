import { GameState, PlayerId } from "gbraver-burst-core";

/** 選択したキャラクターをホストに送信するように要求する */
export type RequestSelectedPlayer = {
  type: "request-selected-player";
  /** ゲームのフローID */
  flowID: string;
};

/** バトルを開始する */
export type BattleStart = {
  type: "battle-start";
  /** ゲームのフローID */
  flowID: string;
  /** ホストプレイヤーのID */
  hostPlayerId: PlayerId;
  /** ゲストプレイヤーのID */
  guestPlayerId: PlayerId;
  /** 更新されたゲームステート履歴 */
  update: GameState[];
};

/** バトルが進行した */
export type BattleProgressed = {
  type: "battle-progressed";
  /** ゲームのフローID */
  flowID: string;
  /** 更新されたゲームステート履歴 */
  update: GameState[];
};

/** ホストから送信されるメッセージ */
export type HostMessage =
  | RequestSelectedPlayer
  | BattleStart
  | BattleProgressed;
