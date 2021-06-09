// @flow

import type {SocketPairFetcher} from "./socket-pair-fetch";
import {Server, Socket} from 'socket.io';
import type {SessionID} from "@gbraver-burst-network/core";

/** サーバ内のソケット接続を取得する */
export class SocketFetcher implements SocketPairFetcher {
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
}