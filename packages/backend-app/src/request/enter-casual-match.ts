/** カジュアルマッチエントリのリクエストボディ */
export type EnterCasualMatch = {
  action: "enter-casual-match";

  /** 選択したアームドーザのID */
  armdozerId: string;

  /** 選択したパイロットのID */
  pilotId: string;
};

/**
 * 任意オブジェクトをカジュアルマッチエントリに変換する
 * 変換でいない場合はnullを返す
 *
 * @param origin 変換元のリクエストボディ
 * @return 変換結果
 */
export function parseEnterCasualMatch(origin: Record<string, any>): EnterCasualMatch | null | undefined {
  return origin?.action === "enter-casual-match" && typeof origin?.armdozerId === "string" && typeof origin?.pilotId === "string" ? {
    action: origin.action,
    armdozerId: origin.armdozerId,
    pilotId: origin.pilotId
  } : null;
}