import { User } from "../../user";
import { RematchRoom } from "./rematch-room";

/**
 * 再戦ルームにエントリ可能かどうかを判定する
 * @param options オプション
 * @param options.room 再戦ルーム
 * @param options.user ユーザー
 * @returns 再戦ルームにエントリ可能かどうか、trueでエントリ可能
 */
export const canEntryRematchRoom = (options: {
  room: RematchRoom;
  user: User;
}) => {
  const { room, user } = options;
  return [room.hostUserID, room.guestUserID].includes(user.userID);
};
