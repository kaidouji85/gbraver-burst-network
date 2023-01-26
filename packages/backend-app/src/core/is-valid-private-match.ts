import { PrivateMatchEntry } from "./private-match-entry";
import { PrivateMatchRoom } from "./private-match-room";
import { User } from "./user";

/** パラメータ */
type Param = {
  /** ルーム作成者 */
  owner: User;
  /** ルーム */
  room: PrivateMatchRoom;
  /** エントリ */
  entries: PrivateMatchEntry[];
};

/**
 * プライベートマッチ関連データが有効であるかを判定する
 * @param param 判定対象
 * @return 判定結果、trueで有効である
 */
export function isValidPrivateMatch(param: Param): boolean {
  const { owner, room, entries } = param;
  return (
    owner.userID === room.owner &&
    entries.map((v) => v.roomID === room.roomID).reduce((a, b) => a && b, true)
  );
}
