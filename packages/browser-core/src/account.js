// @flow

/** アカウント削除 */
export interface loggedInAccountDelete {
  /**
   * 現在ログインしているアカウントを削除する
   *
   * @return 処理が完了したら発火するPromise
   */
  deleteLoggedInAccount(): Promise<void>;
}