// @flow

import type {Entry} from './entry';

/** マッチング情報 */
export type Matching = {
  /** マッチングしたペア */
  entries: [Entry, Entry]
};

/** カジュアルマッチ待合室 */
export interface WaitingRoom {
  /**
   * 待合室にエントリする
   * ペアが見つからない場合はnullを返す
   * 
   * @param entry エントリ
   * @return マッチング結果
   */
  enter(entry: Entry): Promise<?Matching>
}