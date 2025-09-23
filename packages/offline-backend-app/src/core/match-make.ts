import { MatchMaking } from "./connection-state";

type MatchMakingWithSocketId = MatchMaking & { socketId: string };

type Work = {
  matched: [MatchMakingWithSocketId, MatchMakingWithSocketId][];
  waiting: MatchMakingWithSocketId | null;
};

export const matchMake = (entries: (MatchMaking & { socketId: string })[]) =>
  entries.reduce(
    (work: Work, current: MatchMakingWithSocketId) => {
      if (!work.waiting) {
        return { ...work, waiting: current };
      }

      const pair: [MatchMakingWithSocketId, MatchMakingWithSocketId] = [
        work.waiting,
        current,
      ];
      return { matched: [...work.matched, pair], waiting: null };
    },
    { matched: [], waiting: null },
  );
