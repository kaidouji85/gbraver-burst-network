// @flow

import type {SocketPairFetcher} from "./socket-pair-fetch";
import {Server, Socket} from 'socket.io';
import type {SessionID} from "@gbraver-burst-network/core";

/** セッションID指定での検索 */
export interface SessionIDFetcher {
  /**
   * セッションID指定でソケットを検索する
   * 条件に一致するソケットがない場合はnullを返す
   * 
   * @param sessionID 検索するソケットのセッションID
   * @return 検索結果
   */
  fetchBySessionID(sessionID: SessionID): Promise<?typeof Socket>;
}

/** サーバ内のソケット接続を取得する */
export class SocketFetcher implements SocketPairFetcher, SessionIDFetcher {
  _io: typeof Server;

  /**
   * コンストラクタ
   *
   * @param io socket.ioサーバ
   */
  constructor(io: typeof Server) {
    this._io = io;
  }

  /**
   * ソケットのペアを取得する
   * 本メソッドはバトルルームの通知に利用する想定
   *
   * @param sessionIDs 検索対象のセッションID
   * @return 取得結果
   */
  async fetchPair(sessionIDs: [SessionID, SessionID]): Promise<typeof Socket[]> {
    const sockets = await this._io.fetchSockets();
    return sockets.filter(v => v.gbraverBurstAccessToken)
      .filter(v => sessionIDs.includes(v.gbraverBurstAccessToken.sessionID));
  }

  /**
   * セッションID指定でソケットを検索する
   * 条件に一致するソケットがない場合はnullを返す
   * 
   * @param sessionID 検索するソケットのセッションID
   * @return 検索結果
   */
  async fetchBySessionID(sessionID: SessionID): Promise<?typeof Socket> {
    const sockets = await this._io.fetchSockets();
    return sockets.find(v => v.gbraverBurstAccessToken 
      && v.gbraverBurstAccessToken.sessionID === sessionID
    ) ?? null;
  }
}