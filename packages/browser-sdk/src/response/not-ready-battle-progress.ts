/** バトル進行の準備ができていない */
export type NotReadyBattleProgress = {
  action: "not-ready-battle-progress";
};

/**
 * 任意オブジェクトをNotReadyBattleProgressにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
export function parseNotReadyBattleProgress(data: any): NotReadyBattleProgress | null {
  return data?.action === "not-ready-battle-progress" ? {
    action: data.action
  } : null;
}