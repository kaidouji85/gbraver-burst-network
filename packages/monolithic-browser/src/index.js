// @flow

import type {IdPasswordLogin, LoginCheck, UserID} from "@gbraver-burst-network/core";
import {isLogin, login} from "./login";

/** モノシリックサーバ ブラウザ用 SDK */
export class MonolithicBrowser implements IdPasswordLogin, LoginCheck {
  _apiServerURL: string
  _accessToken: string;

  /**
   * コンストラクタ
   *
   * @param apiServerURL APIサーバURL
   */
  constructor(apiServerURL: string) {
    this._apiServerURL = apiServerURL;
    this._accessToken = '';
  }

  /**
   * ユーザID、パスワードでログインを行う
   * ログインに成功した場合はtrueを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return ログイン結果
   */
  async login(userID: UserID, password: string): Promise<boolean> {
    const result = await login(userID, password, this._apiServerURL);
    if (!result.isSuccess) {
      return false;
    }

    this._accessToken = result.accessToken;
    return true;
  }

  /**
   * ログインチェックを行う
   * ログイン済の場合はtrueを返す
   *
   * @return 判定結果
   */
  isLogin(): Promise<boolean> {
    return isLogin(this._accessToken, this._apiServerURL);
  }
}