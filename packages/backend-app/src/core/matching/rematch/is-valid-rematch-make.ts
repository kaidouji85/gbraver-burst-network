import { User } from "../../user";
import { RematchEntry } from "./rematch-entry";
import { RematchRoom } from "./rematch-room";

/**
 * 再戦マッチメーク関連データが有効であるかを判定する
 * @param options オプション
 * @param options.host ルーム作成者
 * @param options.room ルーム
 * @param options.entries エントリ
 * @returns 判定結果、trueで有効である
 */
export const isValidRematchMatch = (options: {
  /** マッチメイク実行ユーザー */
  executor: User;
  /** ルーム */
  room: RematchRoom;
  /** エントリ */
  entries: RematchEntry[];
}): boolean => {
  const { executor, room, entries } = options;
  return (
    executor.userID === room.hostUserID &&
    entries.map((v) => v.roomID === room.roomID).reduce((a, b) => a && b, true)
  );
};
