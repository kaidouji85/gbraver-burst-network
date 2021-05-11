// @flow

/**
 * ユーザID
 * 本IDはシステム内でユニークであると見なされる
 */
export type UserID = string;

/**
 * ユーザ情報
 */
export type User = {
  /** ユーザID */
  id: UserID,
};