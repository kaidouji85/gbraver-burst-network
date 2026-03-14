/**
 * JSONパースを行う
 * JSONパースできなかった場合はnullを返す
 * @param origin パース元
 * @returns パース結果
 */
export function parseJSON(origin: unknown): unknown | null {
  if (typeof origin !== "string") {
    return null;
  }

  try {
    return JSON.parse(origin);
  } catch {
    return null;
  }
}
