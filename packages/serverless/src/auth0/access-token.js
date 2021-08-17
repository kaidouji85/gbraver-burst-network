// @flow

import jwt from 'jsonwebtoken';
import {JwksClient} from 'jwks-rsa';

/**
 * 公開鍵取得関数を生成する
 *
 * @param client jwksRsaクライアント
 * @return 公開鍵取得関数
 */
const createKeyGetter = (client: typeof JwksClient): Function => (header: {kid: string}, callback: Function): void => {
  client.getSigningKey(header.kid)
    .then(key => {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    })
    .catch(err => {
      callback(err, null);
    });
}

/** auth0 アクセストークン */
export type Auth0AccessToken = {
  "iss": string,
  "sub": string,
  "aud": string[],
  "azp": string,
  "exp": number,
  "iat": number,
  "scope": string
}

/**
 * auth0アクセストークンの検証
 * 検証成功の場合、オブジェクトパースしたアクセストークンを返す
 *
 * @param accessToken 検証するアクセストークン
 * @param jwksURL jwks url
 * @param audience オーディエンス
 * @return 検証結果
 */
export function verifyAccessToken(accessToken: string, jwksURL: string, audience: string): Promise<Auth0AccessToken> {
  const client = new JwksClient({jwksUri: jwksURL});
  const keyGetter = createKeyGetter(client);
  return new Promise((resolve, reject) => {
    const algorithms = 'RS256';
    jwt.verify(accessToken, keyGetter, {algorithms, audience}, (err, decodedToken) => {
      err ? reject(err) : resolve(decodedToken);
    });
  });
}