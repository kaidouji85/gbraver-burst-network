import { Command, GameState, PlayerId } from "gbraver-burst-core";

/** バトルに利用するコマンド */
export type BattleCommand = {
  /** バトルID */
  readonly battleId: string;
  /** フローID */
  readonly flowId: string;
  /** プレイヤーID */
  readonly playerId: PlayerId;
  /** コマンド */
  readonly command: Command;
};

/** バトル管理情報 */
export type Battle = {
  /** バトルID */
  readonly battleId: string;
  /** フローID */
  readonly flowId: string;
  /** ゲームステートの履歴 */
  readonly stateHistory: GameState[];
  /**
   * プレイヤーごとのコマンド
   * キーはプレイヤーID
   * 値はコマンド
   */
  readonly commands: Map<PlayerId, BattleCommand>;
};
