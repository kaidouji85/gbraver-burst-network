import type { CasualMatchEntry } from "./casual-match";

/**
 * マッチング
 * @template X エントリのデータ型
 */
export type Matching<X extends CasualMatchEntry> = [X, X];

/**
 * マッチング集計結果
 * @template X エントリのデータ型
 */
type Result<X extends CasualMatchEntry> = {
  working: X[];
  matchingList: Matching<X>[];
};

/**
 * マッチメイクを行う
 *
 * @template X エントリのデータ型
 * @param entries 全エントリ
 * @return マッチメイク結果
 */
export function matchMake<X extends CasualMatchEntry>(
  entries: X[]
): Matching<X>[] {
  if (entries.length <= 1) {
    return [];
  }

  const result = entries.reduce(
    (result: Result<X>, entry: X) => {
      const matching: Matching<X> | null =
        result.working.length === 1 ? [result.working[0], entry] : null;
      const updatedRemainder: X[] = matching ? [] : [entry];
      const updatedMatchingList: Matching<X>[] = matching
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
    }
  );
  return result.matchingList;
}
