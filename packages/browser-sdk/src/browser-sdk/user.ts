/** ユーザ名取得 */
export interface UserNameGet {
  /**
   * ユーザ名を取得する
   *
   * @returns ユーザ名
   */
  getUserName(): Promise<string>;
}

/** ユーザ画像取得 */
export interface UserPictureGet {
  /**
   * ユーザ画像URLを取得する
   *
   * @returns ユーザ画像URL
   */
  getUserPictureURL(): Promise<string>;
}

/** ユーザメールアドレス取得 */
export interface UserMailGet {
  /**
   * メールアドレスを取得する
   *
   * @returns メールアドレス
   */
  getMail(): Promise<string>;
}

/** メール認証完了 */
export interface MailVerify {
  /**
   * メール認証が完了しているか否か
   *
   * @returns 判定結果、trueでメール認証が完了している
   */
  isMailVerified(): Promise<boolean>;
}

/** ユーザ削除削除 */
export interface LoggedInUserDelete {
  /**
   * 現在ログインしているユーザを削除する
   *
   * @returns 処理が完了したら発火するPromise
   */
  deleteLoggedInUser(): Promise<void>;
}
