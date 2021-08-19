// @flow

import type {CasualMatchEntry} from "../dto/casual-match";

/**
 * マッチング
 * @template X エントリのデータ型
 */
export type Matching<X: CasualMatchEntry> = [X, X];

/**
 * マッチメイク結果
 * @template X エントリのデータ型
 */
export type MatchingResult<X: CasualMatchEntry> = {
  /** マッチングしたプレイヤーのリスト */
  matchingList: Matching<X>[],
  /** マッチングできなかったプレイヤーのリスト */
  remainder: X[]
};

/**
 * マッチメイクを行う
 *
 * @template X エントリのデータ型
 * @param entries 全エントリ
 * @return マッチメイク結果
 */
export function matchMake<X: CasualMatchEntry>(entries: X[]): MatchingResult<X> {
  if (entries.length <= 1) {
    return  {matchingList:[], remainder: entries};
  }

  return entries.reduce((result: MatchingResult<X>, entry: X) => {
    const matching = (result.remainder.length) === 1 ? [result.remainder[0], entry] : null;
    const updatedRemainder = matching ? [] : [entry];
    const updatedMatchingList = matching ? [...result.matchingList, matching] : result.matchingList;
    return {remainder: updatedRemainder, matchingList: updatedMatchingList};
  }, {remainder:[], matchingList: []});
}