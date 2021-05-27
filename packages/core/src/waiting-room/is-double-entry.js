// @flow

import type {Entry} from "./entry";
import type {UserID} from "../user";

/**
 * 二重入室か否かを判定する
 *
 * @param entries 待合室の全エントリ
 * @param userID 入室するユーザのID
 * @return 判定結果、trueで二重入室
 */
export function isDoubleEntry(entries: Entry[], userID: UserID): boolean {
  return entries.map(v => v.userID)
    .includes(userID);
}