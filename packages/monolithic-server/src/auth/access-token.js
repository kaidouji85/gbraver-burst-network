// @flow

import type {Session} from "@gbraver-burst-network/core";
import jwt from 'jsonwebtoken';

/** JWT */
export type JWT = string;

/** アクセストークン payload */
export type AccessTokenPayload = {
  /** セッションID */
  sessionID: string
};

/** アクセストークン発行 */
export interface AccessTokenCreator {
  /**
   * アクセストークンを発行する
   *
   * @param session セッション情報
   * @return 発行したアクセストークン
   */
  createAccessToken(session: Session): JWT;
}

/** アクセストークンからペイロードを取得する */
export interface AccessTokenPayloadParser {
  /**
   * JWTからペイロードを取得する
   *
   * @param token 取得元のJWT
   * @return 取得結果結果
   */
  toAccessTokenPayload(token: JWT): Promise<AccessTokenPayload>;
}

/** アクセストークン ユーティリティ */
export class AccessToken implements AccessTokenCreator, AccessTokenPayloadParser {
  _accessTokenSecret: string;

  /**
   * コンストラクタ
   *
   * @param accessTokenSecret アクセストークン秘密鍵
   */
  constructor(accessTokenSecret: string) {
    this._accessTokenSecret = accessTokenSecret;
  }

  /**
   * アクセストークンを発行する
   *
   * @param session セッション情報
   * @return 発行したアクセストークン
   */
  createAccessToken(session: Session): JWT {
    const payload: AccessTokenPayload = {sessionID: session.id};
    return jwt.sign(payload, this._accessTokenSecret, {expiresIn: '40m'});
  }

  /**
   * JWTからペイロードを取得する
   *
   * @param token 取得元のJWT
   * @return 取得結果結果
   */
  toAccessTokenPayload(token: JWT): Promise<AccessTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this._accessTokenSecret, (err, decodedToken) => {
        err ? reject(err) : resolve(decodedToken);
      });
    });
  }
}