"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MonolithicBrowser = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** モノシリックサーバ ブラウザ用 SDK */
var MonolithicBrowser = /*#__PURE__*/function () {
  function MonolithicBrowser() {
    _classCallCheck(this, MonolithicBrowser);
  }

  _createClass(MonolithicBrowser, [{
    key: "login",
    value:
    /**
     * ユーザID、パスワードでログインを行う
     * ログインに成功した場合はtrueを返す
     *
     * @param userID ユーザID
     * @param password パスワード
     * @return ログイン結果
     */
    function login(userID, password) {
      // TODO ちゃんと実装する
      console.log(userID, password);
      return Promise.resolve(true);
    }
  }]);

  return MonolithicBrowser;
}();

exports.MonolithicBrowser = MonolithicBrowser;