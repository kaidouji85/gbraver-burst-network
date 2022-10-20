// @flow

/** カジュアルマッチ入室成功 */
export type EnteredCasualMatch = {
  action: "entered-casual-match",
};

/**
 * 任意のオブジェクトをカジュアルマッチ入室成功にパースする
 * パースできない場合はnullを返す
 *
 * @param data パース元となるオブジェクト
 * @return パース結果
 */
export function parseEnteredCasualMatch(data: Object): ?EnteredCasualMatch {
  return data?.action === "entered-casual-match"
    ? { action: data.action }
    : null;
}
