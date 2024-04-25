/** ユニバーサルログイン */
export interface UniversalLogin {
  /**
   * ログイン成功時のリダイレクトか否かを判定する
   *
   * @returns 判定結果、trueでログイン成功時のリダイレクトである
   */
  isLoginSuccessRedirect(): boolean;

  /**
   * ログイン成功後の処理
   *
   * @returns 処理完了後に発火するPromise
   */
  afterLoginSuccess(): Promise<void>;

  /**
   * ログインページに遷移する
   *
   * @returns ログインページ遷移後に発火するPromise
   */
  gotoLoginPage(): Promise<void>;
}

/** ログインチェック */
export interface LoginCheck {
  /**
   * ログインしているかをチェックする
   *
   * @returns ログインしている場合trueを返す
   */
  isLogin(): Promise<boolean>;
}

/** ログアウト */
export interface Logout {
  /**
   * ログアウトする
   *
   * @returns ログアウト成功したら発火するPromise
   */
  logout(): Promise<void>;
}
