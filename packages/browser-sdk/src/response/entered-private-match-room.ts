/** プライベートマッチルームエントリ成功 */
export type EnteredPrivateMatchRoom = {
  action: "entered-private-match-room";
};

/**
 * 任意オブジェクトをEnteredPrivateMatchRoomにパースする
 * パースできなかった場合、nullを返す
 * @param origin パース元
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseEnteredPrivateMatchRoom(
  origin: any
): EnteredPrivateMatchRoom | null {
  /* eslint-enable */
  if (origin?.action === "entered-private-match-room") {
    return {
      action: "entered-private-match-room",
    };
  }
  return null;
}
