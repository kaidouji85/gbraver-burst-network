// @flow

/**
 * JSONパースを行う
 * JSONパースできなかった場合はnullを返す
 *
 * @param origin パース元
 * @return パース結果
 */
export function parseJSON(origin: any): any {
  try {
    return JSON.parse(origin);
  } catch {
    return null;
  }
}
