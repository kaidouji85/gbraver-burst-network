// @flow

import jwt from 'jsonwebtoken';
import type {AccessTokenPayload} from "./access-token-payload";

/** JWT */
export type JWT = string;

/** アクセストークン発行 */
export interface AccessTokenIssuance {
  /**
   * アクセストークンを発行する
   *
   * @param payload アクセストークンペイロード
   * @return 発行したアクセストークン
   */
  issue(payload: AccessTokenPayload): JWT;
}

/** アクセストークンをデコードする */
export interface PayloadDecoder {
  /**
   * アクセストークンをデコードして、そのペイロードを取得する
   *
   * @param token 取得元のJWT
   * @return 取得結果結果
   */
  decode(token: JWT): Promise<AccessTokenPayload>;
}

/** アクセストークン ユーティリティ */
export class AccessToken implements AccessTokenIssuance, PayloadDecoder {
  _accessTokenSecret: string;

  /**
   * コンストラクタ
   *
   * @param accessTokenSecret アクセストークン秘密鍵
   */
  constructor(accessTokenSecret: string) {
    this._accessTokenSecret = accessTokenSecret;
  }

  /** @override */
  issue(payload: AccessTokenPayload): JWT {
    return jwt.sign(payload, this._accessTokenSecret, {expiresIn: '40m'});
  }

  /** @override */
  decode(token: JWT): Promise<AccessTokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this._accessTokenSecret, (err, decodedToken) => {
        err ? reject(err) : resolve(decodedToken);
      });
    });
  }
}
