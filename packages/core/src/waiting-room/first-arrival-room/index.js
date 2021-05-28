// @flow

import type {EntryResult, WaitingRoom} from "../waiting-room";
import type {Entry} from "../entry";
import {isDoubleEntry} from "../is-double-entry";
import {firstArrivalMatching} from "./first-arrival-matching";

/** 先着順でマッチングされる待合室 */
export class FirstArrivalRoom implements WaitingRoom {
  _entries: Entry[];

  /**
   * コンストラクタ
   */
  constructor() {
    this._entries = [];
  }

  /**
   * 待合室にエントリする
   *
   * @param entry エントリ
   * @return 入室結果
   */
  async enter(entry: Entry): Promise<EntryResult> {
    if (isDoubleEntry(this._entries, entry)) {
      return {type: 'DoubleEntry'};
    }

    const entered = [...this._entries, entry];
    const result = firstArrivalMatching(entered);
    this._entries = result.roomEntries;
    return result.isSuccess
      ? {type: 'Matching', entries: result.matching}
      : {type: 'Waiting'};
  }
}