// @flow

/**
 * 環境変数からアクセストークン秘密鍵を取得する
 *
 * @return 取得結果
 */
export function accessTokenSecretFromEnv(): string {
  return process.env.ACCESS_TOKEN_SECRET ?? '';
}