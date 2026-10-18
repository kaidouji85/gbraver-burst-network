import type { CasualMatchEntry } from "./casual-match-entry";

/**
 * カジュアルマッチング
 * @template X エントリのデータ型
 */
export type CasualMatching<X extends CasualMatchEntry> = [X, X];

/**
 * カジュアルマッチング集計結果
 * @template X エントリのデータ型
 */
type Result<X extends CasualMatchEntry> = {
  working: X[];
  matchingList: CasualMatching<X>[];
};

/**
 * カジュアルマッチメイクを行う
 * @template X エントリのデータ型
 * @param entries 全エントリ
 * @returns マッチメイク結果
 */
export function casualMatchMake<X extends CasualMatchEntry>(
  entries: X[],
): CasualMatching<X>[] {
  if (entries.length <= 1) {
    return [];
  }

  return entries.reduce(
    (result: Result<X>, entry: X) => {
      if (result.working.length === 0) {
        return {
          working: [entry],
          matchingList: result.matchingList,
        };
      } else {
        const matching: CasualMatching<X> = [result.working[0], entry];
        return {
          working: [],
          matchingList: [...result.matchingList, matching],
        };
      }
    },
    { working: [], matchingList: [] },
  ).matchingList;
}
