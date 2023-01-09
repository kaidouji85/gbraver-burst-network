/** バトル強制終了 */
export type SuddenlyBattleEnd = {
  action: "suddenly-battle-end";
};

/**
 * 任意オブジェクトをSuddenlyBattleEndにパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元オブジェクト
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseSuddenlyBattleEnd(data: any): SuddenlyBattleEnd | null {
  /* eslint-enable */
  return data?.action === "suddenly-battle-end"
    ? {
        action: data.action,
      }
    : null;
}
