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
 * @return マッチメイク結果
 */
export function casualMatchMake<X extends CasualMatchEntry>(
  entries: X[],
): CasualMatching<X>[] {
  if (entries.length <= 1) {
    return [];
  }

  const result = entries.reduce(
    (result: Result<X>, entry: X) => {
      const matching: CasualMatching<X> | null =
        result.working.length === 1 ? [result.working[0], entry] : null;
      const updatedRemainder: X[] = matching ? [] : [entry];
      const updatedMatchingList: CasualMatching<X>[] = matching
        ? [...result.matchingList, matching]
        : result.matchingList;
      return {
        working: updatedRemainder,
        matchingList: updatedMatchingList,
      };
    },
    {
      working: [],
      matchingList: [],
    },
  );
  return result.matchingList;
}
