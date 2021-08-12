// @flow

import type {Entry} from "./entry";
import type {UserID} from "../user/user";

/**
 * 指定したユーザIDのエントリーを取り除く
 * 
 * @param roomEntries 待合室の全エントリ 
 * @param userID 取り除くユーザのID
 * @return エントリを取り除いた結果
 */
export function removeEntry(roomEntries: Entry[], userID: UserID): Entry[] {
  return roomEntries.filter(v => v.userID !== userID);
}