// @flow

import {Socket} from "socket.io";
import {accessTokenSecretFromEnv} from "./access-token-secret";
import jwt from "jsonwebtoken";
import {Request, Response} from "express";

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合は401を返す
 * また有効なアクセストーンの場合、req.gbraverBurstAccessTokenに
 * アクセストークン payload をデコードしたものがセットされる
 *
 * @param req リクエスト
 * @param res レスポンス
 * @param next 次のミドルウェアに処理を渡す
 */
export function loginOnlyForExpress(req: typeof Request, res: typeof Response, next: Function): void {
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
  const secret = accessTokenSecretFromEnv();
  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      res.sendStatus(401);
      return;
    }

    req.gbraverBurstAccessToken = decodedToken;
    next();
  });
}

/**
 * ログイン専用ページの制御 expressミドルウェア
 * 有効なアクセストークンでない場合はエラーになる
 * また有効なアクセストーンの場合、socket.gbraverBurstAccessTokenに
 * アクセストークン payload をデコードしたものがセットされる
 *
 * @param socket ソケット
 * @param next 次のミドルウェアに処理を渡す
 */
export function loginOnlyForSocketIO(socket: typeof Socket, next: Function): void {
  const invalidAccessToken = new Error('invalid access token');
  const token = socket.handshake?.auth?.token;
  if (!token && (typeof token !== 'string')) {
    next(invalidAccessToken);
    return;
  }

  const secret = accessTokenSecretFromEnv();
  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      console.log(err);
      next(invalidAccessToken);
      return;
    }

    socket.gbraverBurstAccessToken = decodedToken;
    next();
  });
}