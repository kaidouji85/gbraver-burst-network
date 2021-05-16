// @flow

import type {IdPasswordLogin, UserID} from "@gbraver-burst-network/core";
import {login} from "./login";

/** モノシリックサーバ ブラウザ用 SDK */
export class MonolithicBrowser implements IdPasswordLogin {
  _apiServerURL: string

  /**
   * コンストラクタ
   *
   * @param apiServerURL APIサーバURL
   */
  constructor(apiServerURL: string) {
    this._apiServerURL = apiServerURL;
  }

  /**
   * ユーザID、パスワードでログインを行う
   * ログインに成功した場合はtrueを返す
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return ログイン結果
   */
  login(userID: UserID, password: string): Promise<boolean> {
    return login(userID, password, this._apiServerURL);
  }
}