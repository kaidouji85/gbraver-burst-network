import jwt, { JwtPayload } from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";

/**
 * 公開鍵取得関数を生成する
 *
 * @param client jwksRsaクライアント
 * @return 公開鍵取得関数
 */
const createKeyGetter =
  (client: JwksClient): ((...args: Array<any>) => any) =>
  (
    header: {
      kid: string;
    },
    callback: (...args: Array<any>) => any
  ): void => {
    client
      .getSigningKey(header.kid)
      .then((key) => {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      })
      .catch((err) => {
        callback(err, null);
      });
  };

/** auth0 アクセストークン */
export type Auth0AccessToken = JwtPayload;

/**
 * auth0アクセストークンの検証
 * 検証成功の場合、オブジェクトパースしたアクセストークンを返す
 *
 * @param accessToken 検証するアクセストークン
 * @param jwksURL jwks url
 * @param audience オーディエンス
 * @return 検証結果
 */
export function verifyAccessToken(
  accessToken: string,
  jwksURL: string,
  audience: string
): Promise<Auth0AccessToken> {
  const client = new JwksClient({
    jwksUri: jwksURL,
  });
  const keyGetter = createKeyGetter(client);
  return new Promise((resolve, reject) => {
    jwt.verify(
      accessToken,
      keyGetter,
      {
        algorithms: ["RS256"],
        audience,
      },
      (err, decodedToken) => {
        if (err) {
          reject(err);
        } else if (
          decodedToken === undefined ||
          typeof decodedToken === "string"
        ) {
          reject("invalid jwt token.");
        } else {
          resolve(decodedToken);
        }
      }
    );
  });
}
