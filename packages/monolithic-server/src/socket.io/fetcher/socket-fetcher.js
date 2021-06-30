// @flow

import type {FetchSocketPair, SocketPair} from "./fetch-socket-pair";
import type {FetchSocketBySessionID} from './fetch-socket-by-session-id';
import {Server, Socket} from 'socket.io';
import type {SessionID} from "@gbraver-burst-network/core";

/** サーバ内のソケット接続を取得する */
export class SocketFetcher implements FetchSocketPair, FetchSocketBySessionID {
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
  async fetchPair(sessionIDs: [SessionID, SessionID]): Promise<?SocketPair> {
    const sockets = await this._io.fetchSockets();
    const socketsWithSession = sockets.filter(v => v.gbraverBurstAccessToken);
    const socket0 = socketsWithSession.find(v => v.gbraverBurstAccessToken.sessionID === sessionIDs[0]);
    const socket1 = socketsWithSession.find(v => v.gbraverBurstAccessToken.sessionID === sessionIDs[1]);
    return (socket0 && socket1) ? [socket0, socket1] : null;
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