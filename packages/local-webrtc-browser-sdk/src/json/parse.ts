/**
 * 例外を発生させずにJSONをパースする
 * パース結果はzodなどでバリデーションすることを想定している
 * @param origin パース元
 * @returns パース結果
 */
export function parseJSON(origin: unknown): unknown {
  if (typeof origin !== "string") {
    return null;
  }

  try {
    return JSON.parse(origin);
  } catch {
    return null;
  }
}
