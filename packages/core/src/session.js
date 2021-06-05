// @flow

import type {User} from "./user";

/** セッションID */
export type SessionID = string;

/** セッションの認証情報 */
export type SessionAuth = UserAuth;

/** ユーザ認証 */
type UserAuth = {
  type: 'UserAuth',
  user: User,
};

/** セッション */
export type Session = {
  id: SessionID;
  auth: SessionAuth
};