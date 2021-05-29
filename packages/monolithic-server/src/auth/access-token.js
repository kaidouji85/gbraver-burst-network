// @flow

import type {User} from "@gbraver-burst-network/core";
import jwt from 'jsonwebtoken';
import {accessTokenSecretFromEnv} from "./access-token-secret";

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

