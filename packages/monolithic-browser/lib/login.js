"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * ログイン処理を行う
 *
 * @param userID ユーザID
 * @param password パスワード
 * @param apiServerURL APIサーバのURL
 * @return ログイン結果
 */
function login(_x, _x2, _x3) {
  return _login.apply(this, arguments);
}

function _login() {
  _login = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(userID, password, apiServerURL) {
    var body, resp;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            body = {
              userID: userID,
              password: password
            };
            _context.next = 3;
            return fetch("".concat(apiServerURL, "/login"), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
            });

          case 3:
            resp = _context.sent;
            return _context.abrupt("return", resp.status === 200);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _login.apply(this, arguments);
}