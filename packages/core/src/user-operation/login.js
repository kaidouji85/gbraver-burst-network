// @flow

import type {UserID} from "../user/user";

/**
 * ID、パスワードでのログイン
 */
export interface IdPasswordLogin {
  /**
   * ユーザID、パスワードでログインを行う
   * ログインに成功した場合はtrueを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return ログイン結果
   */
  login(userID: UserID, password: string): Promise<boolean>;
}

/** ログインチェック */
export interface LoginCheck {
  /**
   * ログインしているかをチェックする
   * 
   * @return ログインしている場合trueを返す
   */
  isLogin(): Promise<boolean>;
}

/** ログオフ */
export interface Logout {
  /**
   * ログオフする
   *
   * @return ログオフ成功したら発火するPromise
   */
  logout(): Promise<void>;
}