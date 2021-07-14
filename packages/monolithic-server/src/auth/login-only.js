// @flow

import {Socket} from "socket.io";
import {Request, Response} from "express";
import type {PayloadDecoder} from "./access-token";

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合は401を返す
 * また有効なアクセストーンの場合、req.gbraverBurstUserに
 * UserPayloadをデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @return expressミドルウェア
 */
export const loginOnlyForExpress = (accessToken: PayloadDecoder): Function => async (req: typeof Request, res: typeof Response, next: Function): Promise<void> => {
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
    const payload = await accessToken.decode(token);
    if (payload.type !== 'UserPayload') {
      res.sendStatus(401);
      return;
    }

    req.gbraverBurstUser = payload.user;
    next();
  } catch(err) {
    res.sendStatus(401);
    throw err;
  }
}

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合はエラーになる
 * また有効なアクセストーンの場合、socket.gbraverBurstUserに
 * UserPayloadをデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @return sicket.ioミドルウェア
 */
export const loginOnlyForSocketIO = (accessToken: PayloadDecoder): Function => async (socket: typeof Socket, next: Function): Promise<void> => {
  const invalidAccessToken = new Error('invalid access token');
  try {
    const token = socket.handshake?.auth?.token;
    if (!(token && (typeof token === 'string'))) {
      next(invalidAccessToken);
      return;
    }

    const payload = await accessToken.decode(token);
    if (payload.type !== 'UserPayload') {
      next(invalidAccessToken);
      return;
    }

    socket.gbraverBurstUser = payload.user;
    next();
  } catch(err) {
    next(invalidAccessToken);
    console.error(err);
  }
}