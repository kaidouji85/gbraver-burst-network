// @flow

import type {Entry} from './entry';
import type {UserID} from "../users/user";

/** 入室結果 */
export type EntryResult = Waiting | Matching;

/** ペアが見つかるまで待つ */
export type Waiting = {
  type: 'Waiting'
};

/** マッチングした */
export type Matching= {
  type: 'Matching',
  /** マッチングしたペア */
  entries: [Entry, Entry]
};

/** カジュアルマッチ入室 */
export interface EnterWaitingRoom {
  /**
   * 待合室にエントリする
   *
   * @param entry エントリ
   * @return 入室結果
   */
  enter(entry: Entry): Promise<EntryResult>
}

/** 待合室から退室する */
export interface LeaveWaitingRoom {
  /**
   * 待合室から退室する
   * 
   * @param userID 退出するユーザのID
   */
  leave(userID: UserID): Promise<void>;
}

/** カジュアルマッチ待合室 */
export interface WaitingRoom extends EnterWaitingRoom, LeaveWaitingRoom {}