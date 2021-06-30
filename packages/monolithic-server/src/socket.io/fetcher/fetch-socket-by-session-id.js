// @flow

import {Socket} from 'socket.io';
import type {SessionID} from "@gbraver-burst-network/core";

/** セッションID指定での検索 */
export interface FetchSocketBySessionID {
  /**
   * セッションID指定でソケットを検索する
   * 条件に一致するソケットがない場合はnullを返す
   * 
   * @param sessionID 検索するソケットのセッションID
   * @return 検索結果
   */
  fetchBySessionID(sessionID: SessionID): Promise<?typeof Socket>;
}