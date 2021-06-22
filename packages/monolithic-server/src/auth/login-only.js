// @flow

import {Socket} from "socket.io";
import {Request, Response} from "express";
import type {FindSession} from '@gbraver-burst-network/core';
import type {AccessTokenPayloadParser} from "./access-token";

/** 本ミドルウェアで利用するセッションコンテナの機能 */
interface OwnSessions extends FindSession {}

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合は401を返す
 * また有効なアクセストーンの場合、req.gbraverBurstAccessTokenに
 * アクセストークン payload をデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @param sessions セッションコンテナ
 * @return expressミドルウェア
 */
export const loginOnlyForExpress = (accessToken: AccessTokenPayloadParser, sessions: OwnSessions): Function => async (req: typeof Request, res: typeof Response, next: Function): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.sendStatus(401);
      return;
    }
  
    const splitHeader = authHeader.split(' ');
    if ((splitHeader.length !== 2) && (splitHeader[0] !== 'Bearer')) {
      res.sendStatus(401);
      return;
    }
  
    const token = splitHeader[1];
    const decodedToken = await accessToken.toAccessTokenPayload(token);
    const isNoExistSession = !sessions.find(decodedToken.sessionID);
    if (isNoExistSession) {
      res.sendStatus(401);
      return;  
    }

    req.gbraverBurstAccessToken = decodedToken;
    next();
  } catch(err) {
    console.error(err);
    res.sendStatus(401);
  }
}

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合はエラーになる
 * また有効なアクセストーンの場合、socket.gbraverBurstAccessTokenに
 * アクセストークン payload をデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @param sessions セッションコンテナ
 * @return sicket.ioミドルウェア
 */
export const loginOnlyForSocketIO = (accessToken: AccessTokenPayloadParser, sessions: OwnSessions): Function => async (socket: typeof Socket, next: Function): Promise<void> => {
  const invalidAccessToken = new Error('invalid access token');
  try {
    const token = socket.handshake?.auth?.token;
    if (!token || (typeof token !== 'string')) {
      next(invalidAccessToken);
      return;
    }
  
    const decodedToken = await accessToken.toAccessTokenPayload(token);
    const isNoExistSession = !sessions.find(decodedToken.sessionID);
    if (isNoExistSession) {
      next(invalidAccessToken);
      return;  
    }

    socket.gbraverBurstAccessToken = decodedToken;
    next();
  } catch(err) {
    console.error(err);
    next(invalidAccessToken);
  }
}