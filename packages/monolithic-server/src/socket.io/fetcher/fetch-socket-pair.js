// @flow

import type {SessionID} from "@gbraver-burst-network/core";
import {Socket} from 'socket.io';

/** ソケットのペアを取得する */
export interface FetchSocketPair {
  /**
   * ソケットのペアを取得する
   * 本メソッドはバトルルームの通知に利用する想定
   *
   * @param sessionIDs 検索対象のセッションID
   * @return 取得結果
   */
  fetchPair(sessionIDs: [SessionID, SessionID]): Promise<typeof Socket[]>;
}