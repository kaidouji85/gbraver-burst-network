"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MonolithicBrowser = void 0;

var _login2 = require("./login");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** モノシリックサーバ ブラウザ用 SDK */
var MonolithicBrowser = /*#__PURE__*/function () {
  /**
   * コンストラクタ
   *
   * @param apiServerURL APIサーバURL
   */
  function MonolithicBrowser(apiServerURL) {
    _classCallCheck(this, MonolithicBrowser);

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


  _createClass(MonolithicBrowser, [{
    key: "login",
    value: function login(userID, password) {
      return (0, _login2.login)(userID, password, this._apiServerURL);
    }
  }]);

  return MonolithicBrowser;
}();

exports.MonolithicBrowser = MonolithicBrowser;