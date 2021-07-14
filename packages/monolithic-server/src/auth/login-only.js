// @flow

import {Socket} from "socket.io";
import {Request, Response} from "express";
import type {AccessTokenPayloadDecoder} from "./access-token";

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合は401を返す
 * また有効なアクセストーンの場合、req.gbraverBurstAccessTokenに
 * AccessTokenPayloadをデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @return expressミドルウェア
 */
export const loginOnlyForExpress = (accessToken: AccessTokenPayloadDecoder): Function => async (req: typeof Request, res: typeof Response, next: Function): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.sendStatus(401);
      return;
    }
  
    const splitHeader = authHeader.split(' ');
    if (!(splitHeader.length === 2 && splitHeader[0] === 'Bearer' && splitHeader[1])) {
      res.sendStatus(401);
      return;
    }
  
    const token = splitHeader[1];
    req.gbraverBurstAccessToken = await accessToken.decode(token);
    next();
  } catch(err) {
    res.sendStatus(401);
    throw err;
  }
}

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合はエラーになる
 * また有効なアクセストーンの場合、socket.gbraverBurstAccessTokenに
 * AccessTokenPayloadをデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @return sicket.ioミドルウェア
 */
export const loginOnlyForSocketIO = (accessToken: AccessTokenPayloadDecoder): Function => async (socket: typeof Socket, next: Function): Promise<void> => {
  const invalidAccessToken = new Error('invalid access token');
  try {
    const token = socket.handshake?.auth?.token;
    if (!(token && (typeof token === 'string'))) {
      next(invalidAccessToken);
      return;
    }

    socket.gbraverBurstAccessToken = await accessToken.decode(token);
    next();
  } catch(err) {
    next(invalidAccessToken);
    throw err;
  }
}