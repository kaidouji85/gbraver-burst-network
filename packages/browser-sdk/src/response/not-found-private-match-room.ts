/** エントリしようとしたプライベートマッチルームが見つからない */
export type NotFoundPrivateMatchRoom = {
  action: "not-found-private-match-room";
};

/**
 * 任意オブジェクトをNotFoundPrivateMatchRoomにパースする
 * パースできない場合はnullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseNotFoundPrivateMatchRoom(
  origin: any
): NotFoundPrivateMatchRoom | null {
  /* eslint-enable */
  if (origin?.action === "not-found-private-match-room") {
    return {
      action: "not-found-private-match-room",
    };
  }
  return null;
}
