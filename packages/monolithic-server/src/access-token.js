// @flow

import type {User} from "@gbraver-burst-network/core";
import jwt from 'jsonwebtoken';

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
  const payload = {userID: user.id};
  const secret = accessTokenSecretFromEnv();
  return jwt.sign(payload, secret, {expiresIn: '40m'});
}