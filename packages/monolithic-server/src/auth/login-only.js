// @flow

import {Socket} from "socket.io";
import {Request, Response} from "express";
import type {AccessTokenPayloadParser} from "./access-token";

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合は401を返す
 * また有効なアクセストーンの場合、req.gbraverBurstAccessTokenに
 * アクセストークン payload をデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @return expressミドルウェア
 */
export const loginOnlyForExpress = (accessToken: AccessTokenPayloadParser): Function => (req: typeof Request, res: typeof Response, next: Function): void => {
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
  accessToken.toAccessTokenPayload(token)
    .then(decodedToken => {
      req.gbraverBurstAccessToken = decodedToken;
      next();
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(401);
    });
}

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合はエラーになる
 * また有効なアクセストーンの場合、socket.gbraverBurstAccessTokenに
 * アクセストークン payload をデコードしたものがセットされる
 *
 * @param accessToken アクセストークンユーティリティ
 * @return sicket.ioミドルウェア
 */
export const loginOnlyForSocketIO = (accessToken: AccessTokenPayloadParser): Function => (socket: typeof Socket, next: Function): void => {
  const invalidAccessToken = new Error('invalid access token');
  const token = socket.handshake?.auth?.token;
  if (!token && (typeof token !== 'string')) {
    next(invalidAccessToken);
    return;
  }

  accessToken.toAccessTokenPayload(token)
    .then(decodedToken => {
      socket.gbraverBurstAccessToken = decodedToken;
      next();
    })
    .catch(err => {
      console.error(err);
      next(invalidAccessToken);
    });
}