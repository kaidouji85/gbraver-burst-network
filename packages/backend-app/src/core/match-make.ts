import type { CasualMatchEntry } from "./casual-match";

/**
 * マッチング
 * @template X エントリのデータ型
 */
export type Matching<X extends CasualMatchEntry> = [X, X];

/**
 * マッチメイクを行う
 *
 * @template X エントリのデータ型
 * @param entries 全エントリ
 * @return マッチメイク結果
 */
export function matchMake<X extends CasualMatchEntry>(entries: X[]): Matching<X>[] {
  if (entries.length <= 1) {
    return [];
  }

  const result = entries.reduce((result: {
    working: X[];
    matchingList: Matching<X>[];
  }, entry: X) => {
    const matching = result.working.length === 1 ? [result.working[0], entry] : null;
    const updatedRemainder = matching ? [] : [entry];
    const updatedMatchingList = matching ? [...result.matchingList, matching] : result.matchingList;
    return {
      working: updatedRemainder,
      matchingList: updatedMatchingList
    };
  }, {
    working: [],
    matchingList: []
  });
  return result.matchingList;
}