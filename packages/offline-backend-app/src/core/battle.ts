import { Command, GameState, PlayerId } from "gbraver-burst-core";

/** バトルに利用するコマンド */
export type BattleCommand = {
  /** バトルID */
  battleId: string;
  /** フローID */
  flowId: string;
  /** プレイヤーID */
  playerId: PlayerId;
  /** コマンド */
  command: Command;
};

/** バトル管理情報 */
export type Battle = {
  /** バトルID */
  battleId: string;
  /** フローID */
  flowId: string;
  /** ゲームステートの履歴 */
  stateHistory: GameState[];
  /**
   * プレイヤーごとのコマンド
   * キーはプレイヤーID
   * 値はコマンド
   */
  commands: Map<PlayerId, BattleCommand>;
};
