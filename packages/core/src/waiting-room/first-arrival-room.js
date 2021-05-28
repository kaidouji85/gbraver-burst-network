// @flow

import type {EntryResult, WaitingRoom} from "./waiting-room";
import type {Entry} from "./entry";
import {isDoubleEntry} from "./is-double-entry";

/** 先着順でマッチングされる待合室 */
export class FirstArrivalRoom implements WaitingRoom {
  _entries: Entry[];
  
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
    if (entered.length !== 2) {
      this._entries = entered;
      return {type: 'Waiting'};
    }

    const entries: [Entry, Entry] = [entered[0], entered[1]];
    this._entries = [];
    return {type: 'Matching', entries};
  }
}
