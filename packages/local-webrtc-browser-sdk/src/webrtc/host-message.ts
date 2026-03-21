import { GameState, PlayerId } from "gbraver-burst-core";

/** 選択したキャラクターをホストに送信するように要求する */
export type RequestSelectedPlayer = {
  type: "request-selected-player";
};

/** バトルを開始する */
export type StartBattle = {
  type: "start-battle";
  /** ホストプレイヤーのID */
  hostPlayerId: PlayerId;
  /** ゲストプレイヤーのID */
  guestPlayerId: PlayerId;
  /** ゲームのフローID */
  flowID: string;
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
