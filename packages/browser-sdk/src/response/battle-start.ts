import type { GameState, Player } from "gbraver-burst-core";

/** バトルスタート */
export type BattleStart = {
  action: "battle-start";

  /** プレイヤー情報 */
  player: Player;

  /** 敵情報 */
  enemy: Player;

  /** ステートヒストリー */
  stateHistory: GameState[];

  /** 戦闘ID */
  battleID: string;

  /** フローID */
  flowID: string;

  /** 戦闘進捗ポーリングを実行する側か否か、trueでポーリングをする */
  isPoller: boolean;
};

/**
 * 任意のオブジェクトをStartBattleにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元となる文字列
 * @return パース結果
 */
export function parseBattleStart(data: any): BattleStart | null {
  // TODO player、enemy、stateHistoryの正確な型チェックを実装する
  return data?.action === "battle-start" && typeof data?.battleID === "string" && typeof data?.flowID === "string" && Array.isArray(data?.stateHistory) && data?.player !== null && typeof data?.player === "object" && data?.enemy !== null && typeof data?.enemy === "object" && typeof data?.isPoller === "boolean" ? {
    action: data.action,
    battleID: data.battleID,
    flowID: data.flowID,
    stateHistory: data.stateHistory,
    player: data.player,
    enemy: data.enemy,
    isPoller: data.isPoller
  } : null;
}