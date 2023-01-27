import { PrivateMatchEntry } from "./private-match-entry";
import { PrivateMatching } from "./private-match-make";

/**
 * 削除するプライベートマッチエントリを求める
 * @param matching プライベートマッチ結果
 * @param entries プライベートマッチエントリ
 * @return 削除するプライベートマッチエントリ
 */
export function deletedPrivateMatchEntries(
  matching: PrivateMatching,
  entries: PrivateMatchEntry[]
): PrivateMatchEntry[] {
  const matcingUserIDs = matching.map((v) => v.userID);
  return entries.filter((v) => !matcingUserIDs.includes(v.userID));
}
