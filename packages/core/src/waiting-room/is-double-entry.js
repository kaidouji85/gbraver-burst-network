// @flow

import type {Entry} from "./entry";

/**
 * 二重入室か否かを判定する
 *
 * @param roomEntries 待合室の全エントリ
 * @param entry 入室するエントリ
 * @return 判定結果、trueで二重入室
 */
export function isDoubleEntry(roomEntries: Entry[], entry: Entry): boolean {
  return roomEntries.map(v => v.sessionID)
    .includes(entry.sessionID);
}