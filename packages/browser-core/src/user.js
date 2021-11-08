// @flow

/** ユーザ名取得 */
export interface UserNameGet {
  /**
   * ユーザ名を取得する
   *
   * @return ユーザ名
   */
  getUserName(): Promise<string>;
}

/** ユーザ画像取得 */
export interface UserPictureGet {
  /**
   * ユーザ画像URLを取得する
   *
   * @return ユーザ画像URL
   */
  getUserPictureURL(): Promise<string>;
}

/** ユーザ削除削除 */
export interface LoggedInUserDelete {
  /**
   * 現在ログインしているユーザを削除する
   *
   * @return 処理が完了したら発火するPromise
   */
  deleteLoggedInUser(): Promise<void>;
}