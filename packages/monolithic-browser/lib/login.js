"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = login;

/**
 * ログイン処理を行う
 *
 * @param userID ユーザID
 * @param password パスワード
 * @param apiServerURL APIサーバのURL
 * @return ログイン結果
 */
async function login(userID, password, apiServerURL) {
  const body = {
    userID: userID,
    password: password
  };
  const resp = await fetch(`${apiServerURL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return resp.status === 200;
}