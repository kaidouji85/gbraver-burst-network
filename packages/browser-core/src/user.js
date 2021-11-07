// @flow

/** ユーザ削除削除 */
export interface LoggedInUserDelete {
  /**
   * 現在ログインしているユーザを削除する
   *
   * @return 処理が完了したら発火するPromise
   */
  deleteLoggedInUser(): Promise<void>;
}