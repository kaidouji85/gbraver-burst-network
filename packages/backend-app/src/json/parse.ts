/**
 * JSONパースを行う
 * JSONパースできなかった場合はnullを返す
 *
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseJSON(origin: any): any {
  /* eslint-enable */
  try {
    return JSON.parse(origin);
  } catch {
    return null;
  }
}
