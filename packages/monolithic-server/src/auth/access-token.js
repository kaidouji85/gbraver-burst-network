// @flow

import jwt from 'jsonwebtoken';
import type {AccessTokenPayload} from "./access-token-payload";

/** JWT */
export type JWT = string;

/** アクセストークン発行 */
export interface AccessTokenEncoder {
  /**
   * アクセストークンを発行する
   *
   * @param payload アクセストークンペイロード
   * @return 発行したアクセストークン
   */
  encode(payload: AccessTokenPayload): JWT;
}

/** アクセストークンをデコードする */
export interface AccessTokenPayloadDecoder {
  /**
   * アクセストークンをデコードして、そのペイロードを取得する
   *
   * @param token 取得元のJWT
   * @return 取得結果結果
   */
  decode(token: JWT): Promise<AccessTokenPayload>;
}

/** アクセストークン ユーティリティ */
export class AccessToken implements AccessTokenEncoder, AccessTokenPayloadDecoder {
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
  encode(payload: AccessTokenPayload): JWT {
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
