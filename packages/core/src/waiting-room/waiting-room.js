// @flow

import type {Entry} from './entry';

/** 入室結果 */
export type EntryResult = Waiting | Matching | DoubleEntry;

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

/** 二重入室エラー */
export type DoubleEntry = {
  type: 'DoubleEntry'
};

/** カジュアルマッチ待合室 */
export interface WaitingRoom {
  /**
   * 待合室にエントリする
   *
   * @param entry エントリ
   * @return 入室結果
   */
  enter(entry: Entry): Promise<EntryResult>
}