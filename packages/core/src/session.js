// @flow

import type {User} from "./user";

/**
 * セッションID
 * 本IDはシステム内でユニークな値をとるものと見なす
 */
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