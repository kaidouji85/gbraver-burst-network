"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MonolithicBrowser = void 0;

var _login = require("./login");

/** モノシリックサーバ ブラウザ用 SDK */
class MonolithicBrowser {
  /**
   * コンストラクタ
   *
   * @param apiServerURL APIサーバURL
   */
  constructor(apiServerURL) {
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


  login(userID, password) {
    return (0, _login.login)(userID, password, this._apiServerURL);
  }

}

exports.MonolithicBrowser = MonolithicBrowser;