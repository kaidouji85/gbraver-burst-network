// @flow

import type {User} from "@gbraver-burst-network/core";

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
 * @param user ユーザ情報
 * @return ペイロード
 */
export function toPayload(user: User): UserPayload {
  return {type: 'UserPayload', user}
}
