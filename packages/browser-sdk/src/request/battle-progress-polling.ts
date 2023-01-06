/** バトル進行ポーリング */
export type BattleProgressPolling = {
  action: "battle-progress-polling";

  /** バトルID */
  battleID: string;

  /** フローID */
  flowID: string;
};
