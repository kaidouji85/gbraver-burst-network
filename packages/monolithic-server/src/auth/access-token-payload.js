// @flow

import type {User} from "../users/user";

/** アクセストークンペイロード */
export type AccessTokenPayload = UserPayload;

/** ユーザ情報を格納したペイロード */
export type UserPayload = {
  type: 'UserPayload',
  user: User
};

/**
 * ユーザ情報からペイロードを生成する
 *
 * @param origin ユーザ情報
 * @return ペイロード
 */
export function toPayload(origin: User): UserPayload {
  // originにはUserに定義されていないプロパティが含まれる可能性がある
  // 例えばパスワードが含まれることも、理論上はありえる
  // その場合、JWTトークンにパスワードを平文で含めてしまうことになる
  // それだとまずいので、必要な情報のみを抽出している
  const user: User = {id: origin.id};
  return {type: 'UserPayload', user}
}
