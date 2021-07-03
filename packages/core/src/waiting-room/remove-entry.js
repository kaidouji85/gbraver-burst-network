// @flow

import type {Entry} from "./entry";
import type {SessionID} from '../session/session';

/**
 * 指定したセッションIDのエントリーを取り除く
 * 
 * @param roomEntries 待合室の全エントリ 
 * @param sessionID 取り除くセッションのID 
 * @return エントリを取り除いた結果
 */
export function removeEntry(roomEntries: Entry[], sessionID: SessionID): Entry[] {
  return roomEntries.filter(v => v.sessionID !== sessionID);
}