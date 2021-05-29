// @flow

import type {User} from "@gbraver-burst-network/core";
import jwt from 'jsonwebtoken';
import {Request, Response} from "express";
import {Socket} from 'socket.io';

export type JWT = string;

/** アクセストークン */
export type AccessTokenPayload = {
  /** ユーザID */
  userID: string
};

export interface AccessTokenCreator {
  createAccessToken(user: User): JWT;
}

export interface AccessTokenGetter {
  toAccessTokenPayload(token: JWT): Promise<AccessTokenPayload>;
}

export class AccessToken implements AccessTokenCreator, AccessTokenGetter {
  _accessTokenSecret: string;

  constructor(accessTokenSecret: string) {
    this._accessTokenSecret = accessTokenSecret;
  }

  createAccessToken(user: User): JWT {
    const payload: AccessTokenPayload = {userID: user.id};
    return jwt.sign(payload, this._accessTokenSecret, {expiresIn: '40m'});
  }

  toAccessTokenPayload(token: JWT): Promise<AccessTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this._accessTokenSecret, (err, decodedToken) => {
        err ? reject(err) : resolve(decodedToken);
      });
    });
  }
}

/**
 * 環境変数からアクセストークン秘密鍵を取得する
 *
 * @return 取得結果
 */
function accessTokenSecretFromEnv(): string {
  return process.env.ACCESS_TOKEN_SECRET ?? '';
}

/**
 * @deprecated
 * ユーザ情報からAPI アクセストークンを生成する
 *
 * @param user ユーザ情報
 * @return 生成結果
 */
export function createAccessToken(user: User): Buffer {
  const payload: AccessTokenPayload = {userID: user.id};
  const secret = accessTokenSecretFromEnv();
  return jwt.sign(payload, secret, {expiresIn: '40m'});
}

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