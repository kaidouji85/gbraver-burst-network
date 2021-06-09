// @flow

import type {Stub} from "./stub";
import {MonolithicBrowser} from "@gbraver-burst-network/monolithic-browser";
import type {UserLogin} from "./user-login";

/** ログイン処理のスタブ*/
export class LoginStub implements Stub {
  _url: string;
  _login: UserLogin;

  /**
   * コンストラクタ
   *
   * @param url APIサーバのURL
   * @param login ユーザログイン情報
   */
  constructor(url: string, login: UserLogin) {
    this._url = url;
    this._login = login;
  }

  /**
   * スタブ名を返す
   *
   * @return スタブ名
   */
  name(): string {
    return 'ログイン処理が正しく実行できる';
  }

  /**
   * スタブを実行する
   *
   * @return 実行後に発火するPromise
   */
  async execute(): Promise<void> {
    const browser = new MonolithicBrowser(this._url);
    const isSuccess = await browser.login(this._login.id, this._login.password);
    if (!isSuccess) {
      return Promise.reject();
    }

    const isLogin = await browser.isLogin();
    if (!isLogin) {
      return Promise.reject();
    }
  }
}