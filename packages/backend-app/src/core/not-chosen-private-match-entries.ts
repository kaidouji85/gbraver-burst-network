import { PrivateMatchEntry } from "./private-match-entry";
import { PrivateMatching } from "./private-match-make";

/**
 * マッチングされなかったエントリを求める
 * @param matching プライベートマッチ結果
 * @param entries プライベートマッチエントリ
 * @return マッチングされなかったエントリ
 */
export function notChosenPrivateMatchEntries(
  matching: PrivateMatching,
  entries: PrivateMatchEntry[],
): PrivateMatchEntry[] {
  const matcingUserIDs = matching.map((v) => v.userID);
  return entries.filter((v) => !matcingUserIDs.includes(v.userID));
}
