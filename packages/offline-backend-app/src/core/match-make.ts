import { MatchMaking } from "./connection-state";

/** マッチングされた2つのプレイヤーのペア */
type MatchPair = [MatchMaking, MatchMaking];

/** マッチメイキング処理の作業用オブジェクト */
type Work = {
  /** マッチングが成立したペアの配列 */
  readonly matched: MatchPair[];
  /** 待機中のプレイヤー、nullの場合は待機中のプレイヤーがいない */
  readonly waiting: MatchMaking | null;
};

/**
 * マッチメイキング処理を行う
 * エントリーされたプレイヤーを順番にペアにして、マッチングを成立させる
 * @param entries - マッチメイキング対象のプレイヤーエントリー配列
 * @returns マッチングが成立したペアの配列
 */
export const matchMake = (entries: MatchMaking[]): MatchPair[] =>
  entries.reduce(
    (work: Work, current: MatchMaking) => {
      if (!work.waiting) {
        return { ...work, waiting: current };
      }

      const pair: MatchPair = [work.waiting, current];
      return { matched: [...work.matched, pair], waiting: null };
    },
    { matched: [], waiting: null },
  ).matched;
