import { MatchMaking } from "./connection-state";

/** MatchMaking型にsocketIdを追加した型 */
type MatchMakingWithSocketId = MatchMaking & { socketId: string };

/** マッチングされた2つのプレイヤーのペア */
type MatchPair = [MatchMakingWithSocketId, MatchMakingWithSocketId];

/** マッチメイキング処理の作業用オブジェクト */
type Work = {
  /** マッチングが成立したペアの配列 */
  matched: MatchPair[];
  /** 待機中のプレイヤー、nullの場合は待機中のプレイヤーがいない */
  waiting: MatchMakingWithSocketId | null;
};

/**
 * マッチメイキング処理を行う
 * エントリーされたプレイヤーを順番にペアにして、マッチングを成立させる
 * @param entries - マッチメイキング対象のプレイヤーエントリー配列
 * @returns マッチングが成立したペアの配列
 */
export const matchMake = (
  entries: (MatchMaking & { socketId: string })[],
): MatchPair[] =>
  entries.reduce(
    (work: Work, current: MatchMakingWithSocketId) => {
      if (!work.waiting) {
        return { ...work, waiting: current };
      }

      const pair: MatchPair = [work.waiting, current];
      return { matched: [...work.matched, pair], waiting: null };
    },
    { matched: [], waiting: null },
  ).matched;
