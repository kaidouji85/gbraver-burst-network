/** 何らかの理由でプライベートマッチに参加できなかった */
export type RejectPrivateMatchEntry = {
  action: "reject-private-match-entry";
};

/**
 * 任意オブジェクトをRejectPrivateMatchEntryにパースする
 * パースできない場合はnullを返す
 * @param data パース元となるオブジェクト
 * @return パース結果
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseRejectPrivateMatchEntry(
  origin: any
): RejectPrivateMatchEntry | null {
  /* eslint-enable */
  if (origin?.action === "reject-private-match-entry") {
    return { action: "reject-private-match-entry" };
  }
  return null;
}
