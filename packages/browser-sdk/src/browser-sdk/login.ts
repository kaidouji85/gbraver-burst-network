/** ユニバーサルログイン */
export interface UniversalLogin {
  /**
   * ログインページに遷移する
   * @returns ログインページ遷移後に発火するPromise
   */
  gotoLoginPage(): Promise<void>;
}

/** ログインチェック */
export interface LoginCheck {
  /**
   * ログインしているかをチェックする
   * @returns ログインしている場合trueを返す
   */
  isLogin(): Promise<boolean>;
}

/** ログアウト */
export interface Logout {
  /**
   * ログアウトする
   * @returns ログアウト成功したら発火するPromise
   */
  logout(): Promise<void>;
}
