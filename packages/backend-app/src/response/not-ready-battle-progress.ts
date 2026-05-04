/** バトル進行の準備ができていない */
export type NotReadyBattleProgress = {
  action: "not-ready-battle-progress";
};

/** バトル進行の準備ができていない（定数） */
export const NOT_READY_BATTLE_PROGRESS: NotReadyBattleProgress = {
  action: "not-ready-battle-progress",
};
