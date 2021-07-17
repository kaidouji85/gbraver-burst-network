// @flow

import type {EntryResult, WaitingRoom} from "../waiting-room";
import type {Entry} from "../entry";
import {isDoubleEntry} from "../is-double-entry";
import {firstArrivalMatching} from "./first-arrival-matching";
import {removeEntry} from "../remove-entry";
import type {UserID} from "../../user";

/** 先着順でマッチングされる待合室 */
export class FirstArrivalRoom implements WaitingRoom {
  _entries: Entry[];

  /**
   * コンストラクタ
   */
  constructor() {
    this._entries = [];
  }

  /** @override */
  async enter(entry: Entry): Promise<EntryResult> {
    if (isDoubleEntry(this._entries, entry)) {
      throw new Error('double entry');
    }

    const entered = [...this._entries, entry];
    const result = firstArrivalMatching(entered);
    this._entries = result.roomEntries;
    return result.isSuccess
      ? {type: 'Matching', entries: result.matching}
      : {type: 'Waiting'};
  }

  /** @override */
  async leave(userID: UserID): Promise<void> {
    this._entries = removeEntry(this._entries, userID);
  }
}