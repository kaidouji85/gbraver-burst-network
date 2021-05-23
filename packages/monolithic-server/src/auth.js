// @flow

import type {User} from "@gbraver-burst-network/core";
import jwt from 'jsonwebtoken';
import {Request, Response} from "express";

/** アクセストークン */
export type AccessToken = {
  /** ユーザID */
  userID: string
};

/**
 * 環境変数からアクセストークン秘密鍵を取得する
 *
 * @return 取得結果
 */
function accessTokenSecretFromEnv(): string {
  return process.env.ACCESS_TOKEN_SECRET ?? '';
}

/**
 * ユーザ情報からAPI アクセストークンを生成する
 *
 * @param user ユーザ情報
 * @return 生成結果
 */
export function createAccessToken(user: User): Buffer {
  const payload: AccessToken = {userID: user.id};
  const secret = accessTokenSecretFromEnv();
  return jwt.sign(payload, secret, {expiresIn: '40m'});
}

/**
 * ログイン専用ページの制御ミドルウェア
 * 有効なアクセストークンでない場合は401を返す
 *
 * @param req リクエスト
 * @param res レスポンス
 * @param next 次のミドルウェアに処理を渡す
 */
export function validAccessTokenOnly(req: typeof Request, res: typeof Response, next: Function): void {
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

    req.accessToken = decodedToken;
    next();
  });
}